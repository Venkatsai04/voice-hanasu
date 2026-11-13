import { SarvamVoiceProvider } from './src/providers/SarvamVoiceProvider.js';
import dotenv from 'dotenv';
dotenv.config();

async function testInitiate() {
  const provider = new SarvamVoiceProvider();
  console.log('Testing SarvamVoiceProvider.initiateCall directly...');

  const result = await provider.initiateCall({
    callId: 'test_call_123',
    agent: { name: 'Priya Reddy' },
    lead: { phone: '9705772881', name: 'Sai Kumar' },
    isTest: true
  });

  console.log('Initiate result:', result);
}

testInitiate();
