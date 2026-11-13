const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';
const targetPhone = '+919705772881';
const agentPhone = '+917971414044';

const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;

async function testConnectionIds() {
  const connectionCandidates = [
    'vobiz',
    'sarvam',
    'Sarvam Vobiz',
    'sarvam-vobiz',
    'sarvam_vobiz',
    'rented',
    'telephony',
    'default',
    'primary',
    'sip',
    'vobiz_telephony',
    'sarvam_telephony',
    'inbound',
    'outbound',
    'vobiz-india'
  ];

  for (const conn of connectionCandidates) {
    const payload = {
      app_config: {
        app_id: agentId,
        version_filter: 'latest',
        connection_config: {
          connection_id: conn,
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
      const data = await res.json();
      console.log(`conn: "${conn}" -> Status: ${res.status}`);
      if (res.status === 200 || res.status === 201) {
        console.log('SUCCESS! Outbound call placed with connection:', conn);
        console.log(data);
        return;
      } else {
        const detail = data.data?.details || data.message || JSON.stringify(data);
        if (!detail.includes('not found under org')) {
          console.log(`  -> interesting response: ${detail}`);
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

testConnectionIds();
