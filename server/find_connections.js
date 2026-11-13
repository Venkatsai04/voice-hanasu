const orgId = '01a07018-e12e-793c-9cdb-f4d350937a8a';
const workspaceId = '01a07018-e133-7c6f-9ea7-f97284e86143';
const apiKey = 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';

async function findConnections() {
  const paths = [
    `/api/telephony/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `/api/scheduling/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `/api/outbounds/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `/api/v1/orgs/${orgId}/workspaces/${workspaceId}/connections`,
    `/api/app-authoring/v1/orgs/${orgId}/workspaces/${workspaceId}/phone-numbers`,
    `/api/scheduling/v1/orgs/${orgId}/workspaces/${workspaceId}/phone-numbers`
  ];

  for (const p of paths) {
    const url = `https://apps.sarvam.ai${p}`;
    try {
      const res = await fetch(url, {
        headers: { 'X-API-Key': apiKey }
      });
      console.log(`${res.status} ${p}`);
      if (res.status !== 404) {
        const text = await res.text();
        console.log(`  -> ${text.slice(0, 300)}`);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

findConnections();
