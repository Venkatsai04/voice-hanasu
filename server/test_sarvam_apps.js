const apiKey = 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk';

async function testAppsApi() {
  const endpoints = [
    'https://apps.sarvam.ai/api/v1/users/me',
    'https://apps.sarvam.ai/api/v1/orgs',
    'https://apps.sarvam.ai/api/v1/workspaces',
    'https://apps.sarvam.ai/api/app-authoring/v1/orgs',
    'https://apps.sarvam.ai/api/scheduling/v1/orgs',
    'https://api.sarvam.ai/v1/users/me'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      console.log(`${res.status} ${url}`);
      const text = await res.text();
      console.log(`  -> ${text.slice(0, 300)}`);
    } catch (e) {
      console.log(`ERR ${url}: ${e.message}`);
    }
  }
}

testAppsApi();
