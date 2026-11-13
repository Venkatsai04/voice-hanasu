/**
 * AI Employee Builder Service
 * Converts plain language job descriptions into structured, enterprise-grade AI Employee configurations.
 */
export const generateAgentConfigFromPrompt = (jobPrompt) => {
  const text = (jobPrompt || '').toLowerCase();

  // Detect languages
  const languages = ['English'];
  if (text.includes('telugu') || text.includes('hyderabad') || text.includes('andhra')) {
    languages.push('Telugu');
  }
  if (text.includes('hindi') || text.includes('delhi') || text.includes('mumbai') || text.includes('north')) {
    languages.push('Hindi');
  }
  if (text.includes('tamil') || text.includes('chennai')) {
    languages.push('Tamil');
  }

  // Detect Industry & Role
  let role = 'Outbound Lead Qualification Specialist';
  let name = 'Priya Sharma';
  let style = 'consultative';
  let objective = 'Engage inbound inquiries, verify contact intent, assess buyer criteria, and qualify high-intent opportunities.';

  let infoToCollect = [
    { fieldName: 'budget', description: 'Target budget or spending capacity', required: true },
    { fieldName: 'timeline', description: 'Expected decision or purchase timeline', required: true },
    { fieldName: 'preferredLocation', description: 'Preferred geographic zone or branch', required: false },
    { fieldName: 'decisionMaker', description: 'Whether they are the sole decision maker', required: false }
  ];

  let qualificationCriteria = [
    { criterion: 'Explicit interest in project or service', weight: 30 },
    { criterion: 'Budget meets target threshold', weight: 40 },
    { criterion: 'Decision timeline within 90 days', weight: 30 }
  ];

  if (text.includes('real estate') || text.includes('property') || text.includes('apartment') || text.includes('villa') || text.includes('flat')) {
    role = 'Real Estate Senior Sales Concierge';
    name = languages.includes('Telugu') ? 'Priya Reddy' : 'Ananya Rao';
    style = 'consultative';
    objective = 'Contact prospects who submitted an inquiry for residential/commercial projects. Converse warmly in natural spoken Telugu and English, determine budget, preferred BHK/unit type, location preferences, and purchase timeline, and secure a confirmed site visit.';
    infoToCollect = [
      { fieldName: 'budget', description: 'Customer budget range (e.g. ₹1 Cr - ₹2 Cr)', required: true },
      { fieldName: 'propertyType', description: 'Preferred configuration (2BHK, 3BHK, Villa)', required: true },
      { fieldName: 'location', description: 'Preferred micro-market or proximity', required: true },
      { fieldName: 'timeline', description: 'Purchase timeframe (Immediate, 3 months, 6 months)', required: true }
    ];
    qualificationCriteria = [
      { criterion: 'Budget matches project tier (> ₹1 Crore)', weight: 35 },
      { criterion: 'Active search timeline within 90 days', weight: 35 },
      { criterion: 'Agreed to schedule a weekend site visit walkthrough', weight: 30 }
    ];
  } else if (text.includes('health') || text.includes('clinic') || text.includes('hospital') || text.includes('doctor') || text.includes('patient')) {
    role = 'Patient Care Coordinator';
    name = 'Dr. Aditi Verma';
    style = 'supportive';
    objective = 'Call patients regarding scheduled consultations, preventative health screenings, and follow-up care with empathetic, professional bedside manner.';
    infoToCollect = [
      { fieldName: 'symptomSummary', description: 'Chief health complaint or checkup interest', required: true },
      { fieldName: 'preferredDate', description: 'Preferred appointment day and time slot', required: true },
      { fieldName: 'insuranceProvider', description: 'Health insurance network', required: false }
    ];
    qualificationCriteria = [
      { criterion: 'Patient confirmed identity and interest', weight: 50 },
      { criterion: 'Scheduled or confirmed consultation slot', weight: 50 }
    ];
  } else if (text.includes('saas') || text.includes('software') || text.includes('b2b') || text.includes('demo') || text.includes('sales')) {
    role = 'B2B Account Executive & Demo Qualifier';
    name = 'Arjun Mehta';
    style = 'sales-focused';
    objective = 'Reach out to inbound trial signups or whitepaper downloads, qualify team size and current tech stack pain points, and book a 20-minute executive demo.';
    infoToCollect = [
      { fieldName: 'companySize', description: 'Total employee or team headcount', required: true },
      { fieldName: 'currentTool', description: 'Current software or manual workflow used', required: true },
      { fieldName: 'useCase', description: 'Primary business problem to solve', required: true }
    ];
    qualificationCriteria = [
      { criterion: 'Target team size > 10 users', weight: 40 },
      { criterion: 'Confirmed budget and authority to evaluate', weight: 30 },
      { criterion: 'Accepted calendar invitation for executive demo', weight: 30 }
    ];
  }

  const systemPrompt = `You are ${name}, an experienced ${role} representing Sahara Group.

### CORE OBJECTIVE:
${objective}

### CONVERSATION STYLE & PERSONALITY:
- Tone: ${style === 'consultative' ? 'Professional, polite, attentive, empathetic, and knowledgeable.' : 'Crisp, confident, value-oriented, and solution-focused.'}
- Primary Languages: ${languages.join(', ')}. If the customer speaks or code-switches in Telugu or Hindi, respond naturally in their language without sounding robotic.
- Never interrupt when the customer is speaking.
- Acknowledge their responses warmly before transitioning to the next question.

### CONVERSATION FLOW:
1. GREETING:
   - Identify yourself clearly and mention why you are calling (referencing their inquiry: "I noticed you were looking at {{propertyType}} in {{location}}").
   - Politely ask: "Is now a convenient time for a quick 2-minute chat?"
2. DISCOVERY:
   - Learn their core requirements: ${infoToCollect.map(i => i.fieldName).join(', ')}.
   - Keep questions conversational, not an interrogation.
3. VALUE & CLARIFICATION:
   - Answer their questions directly with confidence.
4. CALL TO ACTION & NEXT STEPS:
   - If qualified, invite them to take the next concrete step (e.g. site visit or video demo).
   - If they are busy, offer a specific callback time (e.g. "Would 6 PM today work better?").
   - If not interested, politely thank them and end smoothly.`;

  return {
    name,
    role,
    plainLanguageJobPrompt: jobPrompt,
    objective,
    systemPrompt,
    languages: Array.from(new Set(languages)),
    primaryLanguage: languages[0] || 'English',
    allowCodeSwitching: true,
    conversationStyle: style,
    personality: 'Attentive, courteous, confident, and highly articulate',
    infoToCollect,
    qualificationCriteria,
    possibleOutcomes: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed'],
    voiceSettings: {
      voiceId: 'sarvam-ananya-warm',
      gender: 'female',
      speed: 1.0,
      pitch: 1.0,
      naturalPauses: true,
      silenceHandlingSeconds: 3.5,
      interruptionHandling: true,
      voicemailHandling: 'detect_and_hangup',
      backgroundAmbience: 'none'
    }
  };
};
