const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const targetPhone = '+919705772881';
const agentPhone = '+917971414044';

const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;

async function testPayloadComplete() {
  const payload = {
    app_config: {
      app_id: agentId,
      connection_config: {
        connection_id: 'sarvam_vobiz',
        agent_phone_number: agentPhone
      }
    },
    user_config: {
      user_phone_number: targetPhone
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': 'dummy'
      },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Validation details:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testPayloadComplete();
