const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';

async function testAgents() {
  const endpoints = [
    `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/agents`,
    `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/agents/Call-bot-ag-baceea75-c21e`,
    `https://apps.sarvam.ai/api/scheduling/v1/orgs/${orgId}/workspaces/${workspaceId}/campaigns`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { 'X-API-Key': apiKey }
      });
      console.log(`\n${res.status} ${url}`);
      const text = await res.text();
      console.log(text);
    } catch (e) {
      console.error(e);
    }
  }
}

testAgents();
