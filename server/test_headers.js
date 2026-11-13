const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk';
const targetPhone = '+919705772881';

const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;

async function testHeaderFormats() {
  const headerVariations = [
    { 'X-API-Key': apiKey },
    { 'api-subscription-key': apiKey },
    { 'Authorization': apiKey },
    { 'Authorization': `Bearer ${apiKey}` },
    { 'x-api-key': apiKey },
    { 'X-Api-Key': apiKey }
  ];

  const payload = {
    app_config: { agent_id: agentId },
    user_config: { user_phone_number: targetPhone }
  };

  for (const h of headerVariations) {
    console.log('\nTesting headers:', JSON.stringify(h));
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...h
        },
        body: JSON.stringify(payload)
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body: ${text.slice(0, 300)}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}

testHeaderFormats();
