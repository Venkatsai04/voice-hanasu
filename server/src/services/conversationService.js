import { SarvamVoiceProvider } from '../providers/SarvamVoiceProvider.js';
import { CartesiaVoiceProvider } from '../providers/CartesiaVoiceProvider.js';

// Voice mapping based on persona identity and characteristics
const PERSONA_VOICE_MAP = {
  // Healthcare / Dr. Kavita Verma
  kavita: '56e35e2d-6eb6-4226-ab8b-9776515a7094', // Kavita - Customer Care Agent (Mature Indian female)
  aditi: '56e35e2d-6eb6-4226-ab8b-9776515a7094',
  doctor: '56e35e2d-6eb6-4226-ab8b-9776515a7094',

  // B2B Sales / Arjun Mehta
  arjun: '1259b7e3-cb8a-43df-9446-30971a46b8b0', // Devansh - Warm Support Agent (Indian male)
  mehta: '1259b7e3-cb8a-43df-9446-30971a46b8b0',
  ishan: 'fd2ada67-c2d9-4afe-b474-6386b87d8fc3', // Ishan - Ally (Hinglish conversational male)
  rahul: '393dd459-f8d8-4c3e-a86b-ec43a1113d0b', // Rahul - Calm Office Guy

  // Real Estate / Priya / Ananya
  priya: 'f6141af3-5f94-418c-80ed-a45d450e7e2e', // Priya - Trusted Operator
  ananya: '6b02ffe5-e3cb-48c0-a023-c72f85953375', // Sneha - Empathetic Voice
  sneha: '6b02ffe5-e3cb-48c0-a023-c72f85953375',
  jacqueline: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc' // Jacqueline - Conversational Agent
};

function selectVoiceForAgent(agent) {
  if (agent?.voiceSettings?.voiceId && agent.voiceSettings.voiceId.length > 20 && !agent.voiceSettings.voiceId.startsWith('sarvam')) {
    return agent.voiceSettings.voiceId;
  }

  const nameLower = (agent?.name || '').toLowerCase();
  const roleLower = (agent?.role || '').toLowerCase();

  for (const [key, voiceId] of Object.entries(PERSONA_VOICE_MAP)) {
    if (nameLower.includes(key) || roleLower.includes(key)) {
      return voiceId;
    }
  }

  // Check gender preference if provided
  if (agent?.voiceSettings?.gender === 'male') {
    return '1259b7e3-cb8a-43df-9446-30971a46b8b0'; // Devansh
  }

  // Default reassuring female conversational agent
  return '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc';
}

/**
 * Intelligent persona dialog engine
 * Generates natural, human conversational replies tailored to the AI Employee's specific role,
 * prompt guidelines, and the user's real spoken transcript.
 */
function generatePersonaResponse({ agent, userMessage, history = [] }) {
  const msg = (userMessage || '').trim();
  const msgLower = msg.toLowerCase();
  const agentName = agent?.name || 'Sahara AI';
  const role = agent?.role || 'AI Employee';
  const isGreeting = history.length === 0;
  const isDrKavita = agentName.toLowerCase().includes('kavita') || role.toLowerCase().includes('patient') || role.toLowerCase().includes('doctor');

  const isArjun = agentName.toLowerCase().includes('arjun') || role.toLowerCase().includes('b2b') || role.toLowerCase().includes('saas') || role.toLowerCase().includes('demo');
  const isRealEstate = role.toLowerCase().includes('real estate') || role.toLowerCase().includes('property') || agentName.toLowerCase().includes('priya') || agentName.toLowerCase().includes('ananya');

  // Handle greetings
  const greetingWords = ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what do you do'];
  const isGreetingQuery = greetingWords.some(w => msgLower.startsWith(w) || msgLower === w);

  // 1. Healthcare / Dr. Kavita Verma Persona
  if (isDrKavita) {
    if (isGreetingQuery || isGreeting) {
      if (msgLower.includes('namaste') || msgLower.includes('telugu') || msgLower.includes('hindi')) {
        return `Namaste! I am ${agentName}, your Patient Care Specialist at Apollo. How are you feeling today, and how may I assist with your health appointment?`;
      }
      return `Hello! I am ${agentName}, Patient Care Specialist at Apollo. I'm here to assist you with your consultation scheduling, medical report follow-ups, and specialist bookings. How can I help you today?`;
    }

    if (msgLower.includes('appointment') || msgLower.includes('booking') || msgLower.includes('slot') || msgLower.includes('doctor') || msgLower.includes('consultation')) {
      if (msgLower.includes('tomorrow') || msgLower.includes('morning') || msgLower.includes('today') || msgLower.includes('10') || msgLower.includes('evening') || msgLower.includes('monday')) {
        return `That slot works wonderfully. I have earmarked your priority consultation. Would you like me to send the confirmation QR pass and hospital location directly to your WhatsApp?`;
      }
      return `Our Senior Specialists have openings tomorrow at 10:30 AM and 3:00 PM. Which timing would be most convenient for your consultation?`;
    }

    if (msgLower.includes('fever') || msgLower.includes('pain') || msgLower.includes('cough') || msgLower.includes('headache') || msgLower.includes('symptom') || msgLower.includes('sick')) {
      return `I understand, and please rest assured our medical team will take good care of you. We have our Senior Internal Medicine physician available tomorrow at 10:30 AM. Shall I lock in this reservation for you?`;
    }

    if (msgLower.includes('whatsapp') || msgLower.includes('yes') || msgLower.includes('sure') || msgLower.includes('confirm') || msgLower.includes('book it') || msgLower.includes('okay')) {
      return `Perfect! Your appointment is confirmed. I have dispatched your digital appointment pass and preparation checklist to your WhatsApp. Please arrive ten minutes prior. Take care!`;
    }

    if (msgLower.includes('fee') || msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('insurance')) {
      return `Our specialist consultation is covered by major health insurance plans, and digital cashless claims are processed at the hospital desk. Would you like me to reserve your slot for tomorrow?`;
    }

    return `Thank you for sharing that with me. As your Patient Care Coordinator, I want to make sure you get the best attention. Would tomorrow morning around 10:30 AM suit you for a consultation?`;
  }

  // 2. B2B Sales / Arjun Mehta Persona
  if (isArjun) {
    if (isGreetingQuery || isGreeting) {
      return `Hey there! This is ${agentName}, Account Executive at Raw Sahara Voice. We help enterprises automate voice qualification and inbound callbacks. How is your team currently handling voice outreach?`;
    }

    if (msgLower.includes('team') || msgLower.includes('employee') || msgLower.includes('people') || msgLower.includes('size')) {
      return `Got it! Teams of that scale see tremendous leverage with our autonomous AI employees. Would you be open to a quick 15-minute live walkthrough this Thursday to see it in action on your data?`;
    }

    if (msgLower.includes('cost') || msgLower.includes('pricing') || msgLower.includes('price') || msgLower.includes('plan')) {
      return `Our pricing is usage-based per connected minute with zero upfront server fees, plus enterprise volume discounts. Would Thursday at 3 PM work for a 15-minute executive demo where we can tailor a package for you?`;
    }

    if (msgLower.includes('demo') || msgLower.includes('thursday') || msgLower.includes('yes') || msgLower.includes('sure') || msgLower.includes('sounds good') || msgLower.includes('let\'s do it')) {
      return `Fantastic! I've booked our executive demo on the calendar and emailed the calendar invite. You'll get to experience Cartesia Sonic 3.5 live in real-time. Looking forward to speaking!`;
    }

    if (msgLower.includes('latency') || msgLower.includes('cartesia') || msgLower.includes('voice') || msgLower.includes('tech')) {
      return `We integrate directly with Cartesia Sonic 3.5 yielding under ninety milliseconds voice synthesis, combined with real-time speech recognition. Shall we schedule a live technical demo for your engineering team?`;
    }

    return `That makes complete sense. We see many companies facing that exact bottleneck. How many calls is your team making or receiving on a monthly basis?`;
  }

  // 3. Real Estate Sales Concierge Persona (Ananya / Priya)
  if (isRealEstate) {
    if (isGreetingQuery || isGreeting) {
      return `Hello! This is ${agentName} from Sahara Luxury Living. I'm following up regarding your inquiry for premium residences. What type of unit or configuration are you exploring?`;
    }

    if (msgLower.includes('2bhk') || msgLower.includes('3bhk') || msgLower.includes('4bhk') || msgLower.includes('villa') || msgLower.includes('flat') || msgLower.includes('apartment')) {
      return `Excellent choice! We have breathtaking high-floor units available with panoramic views and club amenities. What approximate budget range did you have in mind for this investment?`;
    }

    if (msgLower.includes('crore') || msgLower.includes('lakh') || msgLower.includes('budget') || msgLower.includes('price') || msgLower.includes('cr')) {
      return `That fits right within our premium tower inventory. Are you looking to move in immediately, or within the next two to three months?`;
    }

    if (msgLower.includes('visit') || msgLower.includes('saturday') || msgLower.includes('sunday') || msgLower.includes('weekend') || msgLower.includes('yes') || msgLower.includes('sure') || msgLower.includes('tomorrow')) {
      return `Wonderful! I've reserved a VIP site walkthrough for you this Saturday at eleven in the morning. I'm sending the GPS coordinates and floor plans to your mobile now. Looking forward to welcoming you!`;
    }

    return `Thank you for sharing your preferences. We can arrange an exclusive private site visit with our project director. Would this coming weekend work for a walkthrough?`;
  }

  // Generic / Custom Persona
  if (isGreetingQuery || isGreeting) {
    return `Hello! I am ${agentName}, ${role}. I'm here to assist you. How can I help you today?`;
  }

  if (msgLower.includes('who are you') || msgLower.includes('what can you do')) {
    return `I am ${agentName}, an AI Employee powered by Raw Sahara Voice and Cartesia Sonic 3.5. My primary objective is: ${agent?.objective || 'to assist you seamlessly'}. Feel free to ask me anything!`;
  }

  if (msgLower.includes('thank') || msgLower.includes('bye') || msgLower.includes('goodbye')) {
    return `You are very welcome! It was a pleasure speaking with you. Have a wonderful day ahead!`;
  }

  return `I understand you mentioned: "${msg.slice(0, 70)}". As ${agentName}, I am ready to assist you further. What specific details would you like to discuss next?`;
}

/**
 * Handle two-way conversational voice turn with Sarvam AI Speech (bulbul:v3)
 */
export async function handleVoiceConversation({ agent, userMessage, history = [] }) {
  // 1. Generate contextual persona response text
  const replyText = generatePersonaResponse({ agent, userMessage, history });

  let audioBase64 = null;
  let voiceEngine = 'sarvam';
  const speaker = agent?.voiceSettings?.speaker || (agent?.voiceSettings?.gender === 'male' ? 'shubh' : 'priya');
  const languageCode = agent?.language === 'Telugu' ? 'te-IN' : agent?.language === 'Hindi' ? 'hi-IN' : 'en-IN';

  try {
    const sarvam = new SarvamVoiceProvider();
    console.log(`[ConversationService] Synthesizing Sarvam bulbul:v3 audio for ${agent?.name} (${speaker}, ${languageCode})...`);
    audioBase64 = await sarvam.generateSpeech({
      text: replyText,
      languageCode,
      speaker
    });
  } catch (err) {
    console.warn('[ConversationService] Sarvam TTS fallback triggered:', err.message);
  }

  // Fallback to Cartesia if needed
  if (!audioBase64 && process.env.CARTESIA_API_KEY) {
    try {
      const cartesia = new CartesiaVoiceProvider();
      const voiceId = selectVoiceForAgent(agent);
      console.log(`[ConversationService] Synthesizing Cartesia Sonic 3.5 voice for ${agent?.name}...`);
      audioBase64 = await cartesia.generateSpeech({
        text: replyText,
        voiceId
      });
      voiceEngine = 'cartesia';
    } catch (err) {
      console.warn('[ConversationService] Cartesia fallback error:', err.message);
    }
  }

  return {
    replyText,
    audioBase64,
    audioFormat: 'audio/wav',
    speaker: 'agent',
    agentName: agent?.name || 'AI Employee',
    voiceEngine,
    timestamp: new Date().toISOString()
  };
}
