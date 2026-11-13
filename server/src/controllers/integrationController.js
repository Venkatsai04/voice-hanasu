import { Organization } from '../models/Organization.js';
import { config } from '../config/env.js';

export const getIntegrationSettings = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const sarvamApiKey = org.providerConfig?.sarvamApiKey || config.sarvamApiKey || '';
    const maskedKey = sarvamApiKey ? `${sarvamApiKey.slice(0, 6)}••••••••${sarvamApiKey.slice(-4)}` : '';
    const sarvamPhone = org.providerConfig?.telephonyNumber || config.sarvamPhoneNumber || '+917971414044';

    return res.json({
      success: true,
      data: {
        activeProvider: org.voiceProvider || 'sarvam',
        isMockMode: false,
        sarvamApiKeyMasked: maskedKey,
        sarvamConfigured: !!sarvamApiKey,
        telephonyNumber: sarvamPhone,
        sarvamPhoneNumber: sarvamPhone,
        telephonyProvider: 'Sarvam Vobiz',
        telephonyStatus: 'active',
        webhookUrl: `${config.apiUrl}/api/webhooks/sarvam`,
        webhookSecret: org.providerConfig?.webhookSecret || config.webhookSecret,
        timezone: org.timezone,
        callingHours: org.callingHours
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateIntegrationSettings = async (req, res, next) => {
  try {
    const {
      voiceProvider,
      sarvamApiKey,
      webhookSecret,
      telephonyNumber,
      timezone,
      callingHours
    } = req.body;

    const org = await Organization.findById(req.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    if (voiceProvider && ['sarvam', 'mock', 'exotel', 'cartesia', 'twilio'].includes(voiceProvider)) {
      org.voiceProvider = voiceProvider;
    }

    if (!org.providerConfig) org.providerConfig = {};

    if (sarvamApiKey !== undefined) {
      org.providerConfig.sarvamApiKey = sarvamApiKey.trim();
    }
    if (webhookSecret !== undefined) {
      org.providerConfig.webhookSecret = webhookSecret.trim();
    }
    if (telephonyNumber !== undefined) {
      org.providerConfig.telephonyNumber = telephonyNumber.trim();
    }
    if (timezone) {
      org.timezone = timezone;
    }
    if (callingHours) {
      org.callingHours = callingHours;
    }

    await org.save();

    return res.json({
      success: true,
      message: 'Integration settings saved successfully',
      data: {
        activeProvider: org.voiceProvider,
        telephonyNumber: org.providerConfig.telephonyNumber || '+917971414044',
        sarvamConfigured: !!(org.providerConfig?.sarvamApiKey || config.sarvamApiKey)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const testProviderConnection = async (req, res) => {
  try {
    const { provider } = req.body;
    const targetProvider = provider || req.org?.voiceProvider || 'sarvam';

    if (targetProvider === 'mock') {
      return res.json({
        success: true,
        message: 'Mock Voice Engine is operational.'
      });
    }

    // Test Sarvam API key directly
    const sarvamApiKey = req.org?.providerConfig?.sarvamApiKey || config.sarvamApiKey;
    if (!sarvamApiKey) {
      return res.status(400).json({
        success: false,
        message: 'Sarvam API key is not configured.'
      });
    }

    // Live test call to Sarvam TTS API
    const testRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: ['Telephony line operational'],
        target_language_code: 'en-IN',
        speaker: 'priya',
        model: 'bulbul:v3'
      })
    });

    if (!testRes.ok) {
      const errData = await testRes.json().catch(() => ({}));
      return res.status(testRes.status).json({
        success: false,
        message: errData.error?.message || `Sarvam connection failed with status ${testRes.status}`
      });
    }

    return res.json({
      success: true,
      message: `Sarvam Voice & Telephony connected! Active line: ${config.sarvamPhoneNumber} (Sarvam Vobiz).`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
