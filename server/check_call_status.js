const accountSid = 'rawsaharatech1';
const apiKey = '5da8dca4013452681ec9cc0ca3d00983e14af56c00d2cbe7';
const apiToken = 'c7762e466aea564865260d4507121aa592be445c84ec8ade';
const sid = '907ce0e4af3d9a95e242668ffcdf1a98';

async function checkCall() {
  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
  const url = `https://api.exotel.com/v1/Accounts/${accountSid}/Calls/${sid}.json`;
  try {
    const res = await fetch(url, { headers: { Authorization: authHeader } });
    const data = await res.json();
    console.log('Call details:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkCall();
