import { Lead } from '../models/Lead.js';
import { Call } from '../models/Call.js';

export const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      outcome,
      status,
      campaignId,
      search
    } = req.query;

    const query = { organizationId: req.orgId };

    if (outcome && outcome !== 'all' && outcome !== 'undefined') {
      query.outcome = outcome;
    }
    if (status && status !== 'all' && status !== 'undefined') {
      query.status = status;
    }
    if (campaignId && campaignId !== 'undefined') {
      query.campaignId = campaignId;
    }
    if (search && search !== 'undefined') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('campaignId', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Lead.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organizationId: req.orgId })
      .populate('campaignId', 'name agentId');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    // Fetch call history for this specific lead
    const calls = await Call.find({ leadId: lead._id, organizationId: req.orgId })
      .populate('agentId', 'name role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        lead,
        calls
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const { name, phone, email, campaignId, customData = {} } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Lead name and phone number are required.' });
    }

    const lead = await Lead.create({
      organizationId: req.orgId,
      campaignId: campaignId || undefined,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      customData: new Map(Object.entries(customData)),
      status: 'pending',
      outcome: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (err) {
    next(err);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    const { outcome, qualificationScore, notes, nextAction } = req.body;
    if (outcome) lead.outcome = outcome;
    if (qualificationScore !== undefined) lead.qualificationScore = qualificationScore;
    if (notes !== undefined) lead.notes = notes;
    if (nextAction !== undefined) lead.nextAction = nextAction;

    await lead.save();
    return res.json({ success: true, message: 'Lead updated', data: lead });
  } catch (err) {
    next(err);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, organizationId: req.orgId });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }
    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Preview and Validate CSV data
 */
export const previewCsvLeads = async (req, res) => {
  try {
    const { rows = [], columnMapping = {} } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No rows provided to preview.' });
    }

    const phoneCol = columnMapping.phone || 'phone';
    const nameCol = columnMapping.name || 'name';
    const emailCol = columnMapping.email || 'email';

    const validLeads = [];
    const invalidLeads = [];
    const duplicatePhones = new Set();
    const seenInBatch = new Set();

    // Check existing phones in DB for this organization
    const existingLeads = await Lead.find({ organizationId: req.orgId }).select('phone');
    const existingPhones = new Set(existingLeads.map(l => l.phone.replace(/[^0-9+]/g, '')));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawPhone = row[phoneCol]?.toString()?.trim();
      const rawName = row[nameCol]?.toString()?.trim() || 'Prospect';
      const rawEmail = row[emailCol]?.toString()?.trim() || '';

      if (!rawPhone || rawPhone.length < 8) {
        invalidLeads.push({ rowNumber: i + 1, row, reason: 'Missing or invalid phone number' });
        continue;
      }

      const normalizedPhone = rawPhone.replace(/[^0-9+]/g, '');
      const isDuplicate = existingPhones.has(normalizedPhone) || seenInBatch.has(normalizedPhone);

      if (isDuplicate) {
        duplicatePhones.add(normalizedPhone);
      }
      seenInBatch.add(normalizedPhone);

      // Extract custom attributes
      const customData = {};
      for (const [key, val] of Object.entries(row)) {
        if (![phoneCol, nameCol, emailCol].includes(key) && val !== undefined && val !== '') {
          customData[key] = val;
        }
      }

      validLeads.push({
        rowNumber: i + 1,
        name: rawName,
        phone: rawPhone,
        email: rawEmail,
        isDuplicate,
        customData
      });
    }

    return res.json({
      success: true,
      data: {
        totalRows: rows.length,
        validCount: validLeads.length,
        invalidCount: invalidLeads.length,
        duplicateCount: duplicatePhones.size,
        sampleValid: validLeads.slice(0, 5),
        sampleInvalid: invalidLeads.slice(0, 5)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Bulk Import Leads from parsed CSV
 */
export const bulkImportLeads = async (req, res, next) => {
  try {
    const { leads = [], campaignId, skipDuplicates = true } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'No leads provided for import.' });
    }

    const inserted = [];
    const existingPhones = new Set();

    if (skipDuplicates) {
      const existing = await Lead.find({ organizationId: req.orgId }).select('phone');
      existing.forEach(l => existingPhones.add(l.phone.replace(/[^0-9+]/g, '')));
    }

    for (const item of leads) {
      const normalizedPhone = item.phone.replace(/[^0-9+]/g, '');
      if (skipDuplicates && existingPhones.has(normalizedPhone)) {
        continue;
      }
      existingPhones.add(normalizedPhone);

      inserted.push({
        organizationId: req.orgId,
        campaignId: campaignId || undefined,
        name: item.name || 'Prospect',
        phone: item.phone,
        email: item.email || '',
        customData: new Map(Object.entries(item.customData || {})),
        status: 'pending',
        outcome: 'pending'
      });
    }

    if (inserted.length > 0) {
      await Lead.insertMany(inserted);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} leads.`,
      count: inserted.length
    });
  } catch (err) {
    next(err);
  }
};
