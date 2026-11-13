const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk';
const targetPhone = '+919705772881';

async function testOutboundCall() {
  const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;
  console.log('Testing endpoint:', url);

  // Test payload option 1 (standard instant outbound payload)
  const payloads = [
    {
      app_config: {
        agent_id: agentId
      },
      user_config: {
        user_phone_number: targetPhone
      }
    },
    {
      agent_id: agentId,
      phone_number: targetPhone
    },
    {
      app_config: {
        app_id: agentId
      },
      user_config: {
        user_phone_number: targetPhone
      }
    }
  ];

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    console.log(`\n--- Attempting Payload Option ${i + 1} ---`);
    console.log(JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'api-subscription-key': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      console.log(`HTTP Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log('Response body:', text);
      if (res.ok) {
        console.log('SUCCESS! Real call dispatched!');
        break;
      }
    } catch (err) {
      console.error('Request error:', err);
    }
  }
}

testOutboundCall();
