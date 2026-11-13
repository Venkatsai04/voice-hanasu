const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';
const targetPhone = '+919705772881';
const agentPhone = '+917971414044';

const url = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/outbounds`;

async function testAppConfigVersions() {
  const variations = [
    {
      app_config: {
        app_id: agentId,
        version_filter: 'latest',
        connection_config: {
          connection_id: 'sarvam_vobiz',
          agent_phone_number: agentPhone
        }
      },
      user_config: {
        user_phone_number: targetPhone
      }
    },
    {
      app_config: {
        app_id: agentId,
        version_filter: 'specific',
        app_version: 1,
        connection_config: {
          connection_id: 'sarvam_vobiz',
          agent_phone_number: agentPhone
        }
      },
      user_config: {
        user_phone_number: targetPhone
      }
    },
    {
      app_config: {
        app_id: agentId,
        version_filter: 'specific',
        app_version: '1',
        connection_config: {
          connection_id: 'sarvam_vobiz',
          agent_phone_number: agentPhone
        }
      },
      user_config: {
        user_phone_number: targetPhone
      }
    }
  ];

  for (let i = 0; i < variations.length; i++) {
    console.log(`\n--- Test Variation ${i + 1} ---`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(variations[i])
      });

      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body: ${text}`);
    } catch (e) {
      console.error(e);
    }
  }
}

testAppConfigVersions();
