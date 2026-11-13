const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';

const url = `https://apps.sarvam.ai/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`;

async function testAuthHeaders() {
  const headers = [
    { 'Authorization': `Bearer ${apiKey}` },
    { 'Authorization': apiKey },
    { 'api-subscription-key': apiKey },
    { 'X-API-Key': apiKey, 'Authorization': `Bearer ${apiKey}` }
  ];

  for (const h of headers) {
    try {
      const res = await fetch(url, { headers: h });
      console.log(`${res.status} with headers: ${JSON.stringify(h)}`);
      const text = await res.text();
      console.log(`  -> ${text.slice(0, 300)}`);
    } catch (e) {
      console.error(e);
    }
  }
}

testAuthHeaders();
