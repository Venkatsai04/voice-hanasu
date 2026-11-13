import { Queue, Worker } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis.js';
import { Campaign } from '../models/Campaign.js';
import { Lead } from '../models/Lead.js';
import { Agent } from '../models/Agent.js';
import { Call } from '../models/Call.js';
import { Organization } from '../models/Organization.js';
import { getVoiceProvider } from '../providers/providerFactory.js';
import { emitToOrg, emitToCampaign } from '../config/socket.js';

const QUEUE_NAME = 'campaign-calls';

let bullQueue = null;
let bullWorker = null;

// Built-in Resilient In-Memory Queue Runner for environments without local Redis
class InProcessQueueRunner {
  constructor() {
    this.jobs = [];
    this.activeWorkers = new Map(); // campaignId -> activeCount
    this.isProcessing = false;
    this.pollInterval = null;
  }

  start() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => this.processNext(), 800);
  }

  addJob(jobData, delayMs = 0) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      data: jobData,
      runAt: Date.now() + delayMs
    };
    this.jobs.push(job);
    this.start();
    return job;
  }

  async processNext() {
    if (this.jobs.length === 0) return;

    const now = Date.now();
    const eligibleIndices = [];

    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].runAt <= now) {
        eligibleIndices.push(i);
      }
    }

    if (eligibleIndices.length === 0) return;

    // Pick top eligible job
    const jobIndex = eligibleIndices[0];
    const job = this.jobs.splice(jobIndex, 1)[0];

    const campaignId = job.data.campaignId?.toString();
    const activeCount = this.activeWorkers.get(campaignId) || 0;

    // Concurrency check per campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'running') {
      return; // Skip if campaign stopped or paused
    }

    const maxConcurrency = campaign.concurrency || 3;
    if (activeCount >= maxConcurrency) {
      // Re-queue with slight delay to wait for current active call slots to open
      job.runAt = Date.now() + 1500;
      this.jobs.push(job);
      return;
    }

    // Increment active concurrency
    this.activeWorkers.set(campaignId, activeCount + 1);

    try {
      await processCallJob(job.data);
    } catch (err) {
      console.error('[InProcessQueueRunner] Job error:', err);
    } finally {
      const current = this.activeWorkers.get(campaignId) || 1;
      this.activeWorkers.set(campaignId, Math.max(0, current - 1));
    }
  }
}

const inProcessRunner = new InProcessQueueRunner();

/**
 * Main Job Processor executed by either BullMQ Worker or Resilient InProcess Runner
 */
async function processCallJob(data) {
  const { campaignId, leadId, agentId, orgId, attempt = 1 } = data;

  // 1. Verify Campaign is currently active
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status !== 'running') {
    return;
  }

  // 2. Fetch Lead, Agent, Organization
  const [lead, agent, org] = await Promise.all([
    Lead.findById(leadId),
    Agent.findById(agentId),
    Organization.findById(orgId)
  ]);

  if (!lead || !agent) return;

  // Check if lead was already reached
  if (['qualified', 'interested', 'completed'].includes(lead.outcome) && attempt > 1) {
    return;
  }

  // 3. Create Call record in DB
  const call = await Call.create({
    organizationId: orgId,
    campaignId,
    agentId,
    leadId,
    targetPhone: lead.phone,
    targetName: lead.name,
    status: 'queued',
    provider: org?.voiceProvider || 'mock'
  });

  // Update lead status to 'calling'
  lead.status = 'calling';
  await lead.save();

  // Increment Campaign active leads count
  await Campaign.findByIdAndUpdate(campaignId, {
    $inc: { 'leadCounts.active': 1 }
  });

  // Broadcast to Live Campaign Dashboard
  emitToCampaign(campaignId, 'campaign:call_initiated', {
    callId: call._id,
    leadId: lead._id,
    leadName: lead.name,
    leadPhone: lead.phone,
    status: 'initiated'
  });

  emitToOrg(orgId, 'dashboard:activity', {
    type: 'CALL_INITIATED',
    agentName: agent.name,
    leadName: lead.name,
    campaignName: campaign.name,
    timestamp: new Date()
  });

  // 4. Invoke Active Voice Provider
  const provider = getVoiceProvider(org);
  await provider.initiateCall({
    callId: call._id.toString(),
    agent,
    lead,
    orgId: orgId.toString(),
    campaignId: campaignId.toString()
  });
}

/**
 * Initialize Queue and Worker
 */
export const initCampaignQueue = () => {
  if (isRedisAvailable && redisClient) {
    try {
      bullQueue = new Queue(QUEUE_NAME, { connection: redisClient });
      bullWorker = new Worker(QUEUE_NAME, async (job) => {
        return processCallJob(job.data);
      }, {
        connection: redisClient,
        concurrency: 10
      });

      bullWorker.on('failed', (job, err) => {
        console.error(`[BullMQ] Call job ${job?.id} failed:`, err);
      });

      console.log('[Queue] BullMQ Campaign Queue and Worker initialized.');
      return;
    } catch {
      console.warn('[Queue] Failed to initialize BullMQ with Redis. Switching to InProcess runner.');
    }
  }

  // Fallback
  inProcessRunner.start();
  console.log('[Queue] InProcess Resilient Campaign Runner active.');
};

/**
 * Dispatch a lead call job into the campaign queue
 */
export const enqueueCampaignCall = async (jobData, delayMs = 0) => {
  if (bullQueue && isRedisAvailable) {
    return bullQueue.add('call', jobData, {
      delay: delayMs,
      removeOnComplete: true,
      removeOnFail: false
    });
  }

  return inProcessRunner.addJob(jobData, delayMs);
};

/**
 * Bulk launch campaign leads
 */
export const launchCampaignLeads = async (campaign, agent, leads) => {
  // Stagger lead dispatches slightly for realism (300ms intervals)
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    await enqueueCampaignCall({
      campaignId: campaign._id,
      leadId: lead._id,
      agentId: agent._id,
      orgId: campaign.organizationId,
      attempt: 1
    }, i * 350);
  }
};
