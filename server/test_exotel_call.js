const accountSid = 'rawsaharatech1';
const apiKey = '5da8dca4013452681ec9cc0ca3d00983e14af56c00d2cbe7';
const apiToken = 'c7762e466aea564865260d4507121aa592be445c84ec8ade';
const callerId = '04045209524'; // Exotel registered virtual number
const appId = '1334032';
const target = '09705772881';

async function testExotel() {
  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiToken}`).toString('base64');
  const url = `https://api.exotel.com/v1/Accounts/${accountSid}/Calls/connect.json`;
  const bodyParams = new URLSearchParams({
    From: target,
    CallerId: callerId,
    Url: `http://my.exotel.com/${accountSid}/exoml/start_voice/${appId}`,
    CallType: 'trans'
  });

  try {
    console.log(`Attempting real PSTN call to ${target} via Exotel CallerId ${callerId}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testExotel();
