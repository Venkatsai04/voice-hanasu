const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const agentId = 'Call-bot-ag-baceea75-c21e';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';

async function inspectAgentAndConnections() {
  const endpoints = [
    `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/apps`,
    `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/apps/${agentId}`,
    `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/deployments`,
    `https://apps.sarvam.ai/api/telephony/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `https://apps.sarvam.ai/api/telephony/v1/orgs/${orgId}/workspaces/${workspaceId}/phone-numbers`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      console.log(`\n${res.status} ${url}`);
      const text = await res.text();
      console.log(text.slice(0, 500));
    } catch (e) {
      console.error(e);
    }
  }
}

inspectAgentAndConnections();
