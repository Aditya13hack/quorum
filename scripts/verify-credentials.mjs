import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Verifying credentials...\n');

// 1. Verify Groq API Key
async function verifyGroq() {
  const apiKey = process.env.AI_API_KEY;
  console.log('1️⃣ Testing Groq API Key...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'Reply with valid JSON: {"status": "ok"}' }],
        response_format: { type: 'json_object' },
        max_tokens: 30,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('   ✅ Groq API verified successfully! Response:', data.choices[0].message.content);
      return true;
    } else {
      console.log('   ❌ Groq API error:', res.status, await res.text());
      return false;
    }
  } catch (e) {
    console.log('   ❌ Groq API network error:', e.message);
    return false;
  }
}

// 2. Verify PayPal Sandbox OAuth
async function verifyPayPal() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  console.log('\n2️⃣ Testing PayPal Sandbox Credentials...');

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (res.ok) {
      const data = await res.json();
      console.log('   ✅ PayPal Sandbox OAuth verified successfully!');
      console.log('   Token type:', data.token_type, '| Expires in:', data.expires_in, 'seconds');
      console.log('   App ID:', data.app_id);
      return true;
    } else {
      console.log('   ❌ PayPal OAuth error:', res.status, await res.text());
      return false;
    }
  } catch (e) {
    console.log('   ❌ PayPal network error:', e.message);
    return false;
  }
}

async function run() {
  const groqOk = await verifyGroq();
  const ppOk = await verifyPayPal();
  console.log('\n──────────────────────────────────────');
  if (groqOk && ppOk) {
    console.log('🎉 ALL CREDENTIALS VERIFIED & WORKING PERFECTLY!');
  } else {
    console.log('⚠️ Some credentials failed verification.');
  }
}

run();
