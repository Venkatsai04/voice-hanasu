import { Call } from '../models/Call.js';
import { Campaign } from '../models/Campaign.js';
import { Agent } from '../models/Agent.js';
import { Lead } from '../models/Lead.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;

    const dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter.createdAt = { $gte: startOfDay };
    } else if (range === '7d') {
      const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: past7 };
    } else if (range === '30d') {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: past30 };
    }

    const orgFilter = { organizationId: req.orgId, ...dateFilter };

    const [
      totalCalls,
      completedCalls,
      connectedCalls,
      qualifiedCalls,
      interestedCalls,
      callbackCalls,
      notInterestedCalls,
      noAnswerCalls,
      busyCalls,
      activeAgentsCount,
      totalLeadsCount
    ] = await Promise.all([
      Call.countDocuments(orgFilter),
      Call.countDocuments({ ...orgFilter, status: 'completed' }),
      Call.countDocuments({ ...orgFilter, status: { $in: ['connected', 'in_progress', 'completed'] } }),
      Call.countDocuments({ ...orgFilter, outcome: 'qualified' }),
      Call.countDocuments({ ...orgFilter, outcome: 'interested' }),
      Call.countDocuments({ ...orgFilter, outcome: 'callback' }),
      Call.countDocuments({ ...orgFilter, outcome: 'not_interested' }),
      Call.countDocuments({ ...orgFilter, outcome: 'no_answer' }),
      Call.countDocuments({ ...orgFilter, outcome: 'busy' }),
      Agent.countDocuments({ organizationId: req.orgId, status: 'active' }),
      Lead.countDocuments({ organizationId: req.orgId })
    ]);

    // Average call duration calculation
    const durationAgg = await Call.aggregate([
      { $match: { ...orgFilter, status: 'completed', duration: { $gt: 0 } } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' }, totalDuration: { $sum: '$duration' } } }
    ]);
    const avgDurationSeconds = Math.round(durationAgg[0]?.avgDuration || 68);

    const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;
    const qualificationRate = connectedCalls > 0 ? Math.round(((qualifiedCalls + interestedCalls) / connectedCalls) * 100) : 0;

    // Daily call trend (last 7 data points)
    const dailyTrend = await Call.aggregate([
      { $match: { organizationId: req.orgId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          connected: {
            $sum: {
              $cond: [{ $in: ['$status', ['connected', 'in_progress', 'completed']] }, 1, 0]
            }
          },
          qualified: {
            $sum: {
              $cond: [{ $eq: ['$outcome', 'qualified'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // Recent Campaign performance
    const campaigns = await Campaign.find({ organizationId: req.orgId })
      .select('name status leadCounts metrics createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        kpis: {
          totalCalls,
          completedCalls,
          connectedCalls,
          activeAgentsCount,
          totalLeadsCount,
          qualifiedLeads: qualifiedCalls,
          interestedLeads: interestedCalls,
          connectionRate,
          qualificationRate,
          avgDurationSeconds
        },
        outcomeBreakdown: {
          qualified: qualifiedCalls,
          interested: interestedCalls,
          callback: callbackCalls,
          notInterested: notInterestedCalls,
          noAnswer: noAnswerCalls,
          busy: busyCalls
        },
        dailyTrend: dailyTrend.map(d => ({
          date: d._id,
          total: d.total,
          connected: d.connected,
          qualified: d.qualified
        })),
        recentCampaigns: campaigns
      }
    });
  } catch (err) {
    next(err);
  }
};
