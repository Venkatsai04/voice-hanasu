const apiKey = 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk';

async function testEndpoints() {
  console.log('Testing Sarvam API endpoints with user key...');

  const endpoints = [
    'https://api.sarvam.ai/voice-agents',
    'https://api.sarvam.ai/v1/agents',
    'https://api.sarvam.ai/outbounds',
    'https://apps.sarvam.ai/api/v1/workspaces',
    'https://apps.sarvam.ai/api/v1/agents',
    'https://apps.sarvam.ai/api/outbounds',
    'https://api.sarvam.ai/phone-numbers'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'api-subscription-key': apiKey,
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      });
      console.log(`${res.status} ${url}`);
      if (res.status !== 404) {
        const text = await res.text();
        console.log(`  -> ${text.slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`ERR ${url}: ${e.message}`);
    }
  }
}

testEndpoints();
