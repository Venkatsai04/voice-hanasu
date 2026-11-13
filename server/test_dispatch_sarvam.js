const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';
const connectionId = '9eb5d4b7-60-df7af9c8-6801';
const targetPhone = '+919705772881';
const agentPhone = '+917971414044';

const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;

async function dispatchRealSarvamCall() {
  console.log('Dispatching REAL Sarvam Telephony Outbound Call...');
  console.log('Org:', orgId);
  console.log('Workspace:', workspaceId);
  console.log('Agent:', agentId);
  console.log('Connection:', connectionId);
  console.log('Caller ID:', agentPhone);
  console.log('Target:', targetPhone);

  const payload = {
    app_config: {
      app_id: agentId,
      version_filter: 'latest',
      connection_config: {
        connection_id: connectionId,
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
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Call dispatch error:', err);
  }
}

dispatchRealSarvamCall();
