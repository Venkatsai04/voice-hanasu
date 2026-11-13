import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Agent } from '../models/Agent.js';
import { Lead } from '../models/Lead.js';
import { Campaign } from '../models/Campaign.js';
import { Call } from '../models/Call.js';
import { PhoneConnection } from '../models/PhoneConnection.js';

export const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected. Cleaning up old demo data...');

    // Clear existing collections for a pristine state
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Agent.deleteMany({}),
      Lead.deleteMany({}),
      Campaign.deleteMany({}),
      Call.deleteMany({}),
      PhoneConnection.deleteMany({})
    ]);

    console.log('[Seed] Creating demo Organization...');
    const org = await Organization.create({
      name: 'Sahara Living & Enterprise Technologies',
      slug: 'sahara-living',
      voiceProvider: 'sarvam',
      timezone: 'Asia/Kolkata',
      callingHours: { start: '09:30', end: '19:30' },
      providerConfig: {
        sarvamApiKey: process.env.SARVAM_API_KEY || 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk',
        webhookSecret: 'sahara_webhook_secret_signing_key_secure_2026',
        telephonyNumber: '+917971414044'
      }
    });

    console.log('[Seed] Creating demo User admin@sahara.ai...');
    const passwordHash = await User.hashPassword('Password123!');
    const user = await User.create({
      organizationId: org._id,
      name: 'Vikramaditya Rao',
      email: 'admin@sahara.ai',
      passwordHash,
      role: 'admin'
    });

    console.log('[Seed] Creating Primary Telephony Line...');
    await PhoneConnection.create({
      organizationId: org._id,
      phoneNumber: '+917971414044',
      friendlyName: 'Primary Autonomous Voice Trunk',
      provider: 'sarvam',
      status: 'active',
      isDefault: true
    });

    console.log('[Seed] Creating 1 Flagship Default Voice Agent...');
    const priya = await Agent.create({
      organizationId: org._id,
      name: 'Priya Reddy',
      role: 'Senior Voice Advisor & Concierge',
      description: 'Engages inbound & outbound inquiries, converses fluently in natural Tenglish (Telugu + English), qualifies prospect requirements, and confirms VIP site visits.',
      objective: 'Call prospects regarding luxury residential projects in Hyderabad. Converse naturally in Tenglish. Understand budget, timeline, configuration, and confirm weekend site visit appointment.',
      systemPrompt: `You are Priya Reddy, an experienced Senior Voice Advisor for Sahara Living in Hyderabad.
You speak naturally in fluent Tenglish (a smooth blend of spoken Telugu and conversational English).
Listen carefully to the buyer's budget, preferred location (Financial District, Gachibowli, Kokapet), property configuration (2BHK, 3BHK, Villa), and purchase timeline.
If the customer is interested, warmly confirm an exclusive private site visit this Saturday.`,
      languages: ['Telugu', 'English'],
      primaryLanguage: 'Telugu',
      allowCodeSwitching: true,
      conversationStyle: 'consultative',
      personality: 'Warm, respectful, articulate, patient, and persuasive',
      infoToCollect: [
        { fieldName: 'budget', description: 'Customer target budget range', required: true },
        { fieldName: 'location', description: 'Preferred micro-market in Hyderabad', required: true },
        { fieldName: 'propertyType', description: '2BHK, 3BHK, Penthouse, or Villa', required: true },
        { fieldName: 'timeline', description: 'Decision and registration timeframe', required: true }
      ],
      qualificationCriteria: [
        { criterion: 'Budget meets or exceeds ₹1.5 Crores', weight: 40 },
        { criterion: 'Purchase timeline within 60 days', weight: 30 },
        { criterion: 'Accepted site visit appointment', weight: 30 }
      ],
      possibleOutcomes: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed'],
      voiceSettings: {
        voiceId: 'priya-warm-tenglish',
        gender: 'female',
        speed: 1.0,
        pitch: 1.0,
        naturalPauses: true,
        silenceHandlingSeconds: 3.5,
        interruptionHandling: true,
        voicemailHandling: 'detect_and_hangup',
        backgroundAmbience: 'quiet_office'
      },
      providerInformation: {
        provider: 'sarvam',
        providerAgentId: 'Call-bot-ag-baceea75-c21e',
        syncedAt: new Date()
      },
      status: 'active',
      stats: {
        totalCalls: 34,
        qualifiedLeads: 26,
        interestedLeads: 6,
        connectedCalls: 32
      }
    });

    console.log('[Seed] Creating demo Campaign...');
    const campaign = await Campaign.create({
      organizationId: org._id,
      agentId: priya._id,
      name: 'Financial District Luxury Towers - Phase 2 Launch',
      description: 'High-priority outbound qualification campaign targeting pre-registered web inquiries for 3BHK and 4BHK apartments.',
      status: 'draft',
      schedule: {
        timezone: 'Asia/Kolkata',
        callingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        callingHours: { start: '10:00', end: '19:00' }
      },
      retryConfig: {
        maxAttempts: 2,
        delayMinutes: 30,
        retryOn: ['no_answer', 'busy', 'failed']
      },
      concurrency: 3,
      leadCounts: {
        total: 10,
        pending: 10,
        active: 0,
        completed: 0
      },
      metrics: {
        total: 10,
        completed: 0,
        active: 0,
        connected: 0,
        qualified: 0,
        interested: 0,
        callbacks: 0,
        notInterested: 0,
        noAnswer: 0,
        busy: 0,
        failed: 0
      }
    });

    console.log('[Seed] Creating sample Leads with dynamic customData...');
    const demoLeads = [
      { name: 'Suresh Kumar Nambiar', phone: '+91 98490 12345', email: 'suresh.n@tcs.com', customData: { city: 'Hyderabad', budget: '₹1.8 Crores', propertyType: '3BHK Flat', timeline: 'Within 60 days' } },
      { name: 'Lakshmi Narayana Rao', phone: '+91 97011 23456', email: 'ln.rao@gmail.com', customData: { city: 'Hyderabad', budget: '₹2.2 Crores', propertyType: '4BHK Penthouse', timeline: 'Immediate' } },
      { name: 'Dr. Venkat Raman', phone: '+91 94400 34567', email: 'dr.venkat@apollo.org', customData: { city: 'Hyderabad', budget: '₹1.5 Crores', propertyType: '3BHK Flat', timeline: '3 Months' } },
      { name: 'Sneha Reddy', phone: '+91 99890 45678', email: 'sneha.reddy@techm.com', customData: { city: 'Hyderabad', budget: '₹1.4 Crores', propertyType: '3BHK Flat', timeline: '45 Days' } },
      { name: 'Rajesh Kothari', phone: '+91 98230 56789', email: 'rajesh.k@kothari.in', customData: { city: 'Secunderabad', budget: '₹1.1 Crores', propertyType: '2BHK Luxury', timeline: '6 Months' } },
      { name: 'Ananya Deshmukh', phone: '+91 91234 67890', email: 'ananya.d@fintech.co', customData: { city: 'Hyderabad', budget: '₹2.5 Crores', propertyType: 'Villa', timeline: 'Immediate' } },
      { name: 'Kiran Goud', phone: '+91 95500 78901', email: 'kiran.goud@yahoo.com', customData: { city: 'Cyberabad', budget: '₹1.6 Crores', propertyType: '3BHK Flat', timeline: '60 Days' } },
      { name: 'Madhavi Latha', phone: '+91 96180 89012', email: 'madhavi.l@gmail.com', customData: { city: 'Hyderabad', budget: '₹1.75 Crores', propertyType: '3BHK Flat', timeline: 'Within 30 days' } },
      { name: 'Prasad Babu', phone: '+91 98850 90123', email: 'prasad.babu@infra.com', customData: { city: 'Gachibowli', budget: '₹2.0 Crores', propertyType: '3.5BHK Flat', timeline: 'Immediate' } },
      { name: 'Divya Srikanth', phone: '+91 97000 01234', email: 'divya.sri@wipro.com', customData: { city: 'Kondapur', budget: '₹1.35 Crores', propertyType: '3BHK Flat', timeline: '90 Days' } }
    ];

    const createdLeads = [];
    for (const l of demoLeads) {
      const lead = await Lead.create({
        organizationId: org._id,
        campaignId: campaign._id,
        name: l.name,
        phone: l.phone,
        email: l.email,
        customData: new Map(Object.entries(l.customData)),
        status: 'pending',
        outcome: 'pending'
      });
      createdLeads.push(lead);
    }

    console.log('[Seed] Creating sample completed Calls with transcripts & AI qualification...');
    // Create 3 realistic completed calls
    await Call.create({
      organizationId: org._id,
      campaignId: campaign._id,
      agentId: priya._id,
      leadId: createdLeads[0]._id,
      targetPhone: createdLeads[0].phone,
      targetName: createdLeads[0].name,
      task: 'Qualify 3BHK high-rise inquiry in Financial District, verify budget and book Saturday site visit',
      provider: 'sarvam',
      providerCallId: 'trunk_call_seed_01',
      status: 'completed',
      outcome: 'qualified',
      duration: 112,
      sentiment: 'positive',
      qualificationData: {
        score: 94,
        reasons: [
          'Confirmed budget of ₹1.8 Crores matches 3BHK tower pricing',
          'Planning to finalize and register within 60 days',
          'Agreed to attend private site visit on Saturday at 11:30 AM'
        ],
        extractedFields: new Map([
          ['budget', '₹1.8 Crores'],
          ['location', 'Financial District'],
          ['propertyType', '3BHK Flat'],
          ['timeline', '60 Days']
        ])
      },
      nextAction: 'Confirm Saturday 11:30 AM VIP site visit with Sales Director & send WhatsApp brochure',
      summary: 'Spoke with Suresh Kumar Nambiar. Customer confirmed active interest in 3BHK high-rise in Financial District. Spoke in mixed Telugu and English (Tenglish). Pre-verified loan readiness and locked in Saturday 11:30 AM walkthrough.',
      recordingUrl: 'https://actions.google.com/sounds/v1/speech/announcement_tone.ogg',
      transcript: [
        { speaker: 'agent', text: 'Namaskaram Suresh garu! I am Priya calling from Sahara Living regarding your online enquiry for our Financial District project. Ela unnaru? Is now a good time to speak?', timestamp: 4, language: 'te' },
        { speaker: 'user', text: 'Namaskaram Priya garu, yes I can talk for 2 minutes. Cheppandi.', timestamp: 9, language: 'te' },
        { speaker: 'agent', text: 'Thank you sir. Meeku 3BHK luxury apartment looking lo unnarani choosamu. Roughly mee preferred budget range entha anukuntunnaru?', timestamp: 16, language: 'te' },
        { speaker: 'user', text: 'Around 1.8 to 2 Crores is our budget. High-floor unit kavali facing the central clubhouse.', timestamp: 24, language: 'en' },
        { speaker: 'agent', text: 'Wonderful! 14th and 18th floors lo premium 3BHK units facing the 5-acre landscaped deck available unnayi. Purchase timeline eppudu plan chestunnaru sir?', timestamp: 35, language: 'te' },
        { speaker: 'user', text: 'We want to register within 60 days. Everything is ready.', timestamp: 42, language: 'en' },
        { speaker: 'agent', text: 'Excellent! Can I arrange a private site walkthrough for you and your family this Saturday at 11:30 AM? Our project lead will personally receive you.', timestamp: 54, language: 'te' },
        { speaker: 'user', text: 'Sure Priya garu, please book Saturday 11:30 AM. Kindly WhatsApp me the location map.', timestamp: 62, language: 'en' },
        { speaker: 'agent', text: 'Chala dhanyavadalu Suresh garu. Location map and brochure turant WhatsApp chestunna. Have a pleasant day!', timestamp: 71, language: 'te' }
      ],
      startedAt: new Date(Date.now() - 3600000),
      connectedAt: new Date(Date.now() - 3598000),
      endedAt: new Date(Date.now() - 3486000)
    });

    console.log('[Seed] Database successfully seeded with full production demo agency!');
    console.log('[Seed] Login credentials:');
    console.log('   Email: admin@sahara.ai');
    console.log('   Password: Password123!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  } finally {
    await mongoose.disconnect();
  }
};

// If run directly via `node src/seeds/seedData.js`
if (process.argv[1]?.endsWith('seedData.js')) {
  runSeed().then(() => process.exit(0));
}
