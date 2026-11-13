import { config } from '../config/env.js';
import { SarvamVoiceProvider } from './SarvamVoiceProvider.js';

let sarvamProviderInstance = null;

export const getSarvamProvider = (customApiKey = null, customSecret = null, customPhone = null) => {
  const key = customApiKey || config.sarvamApiKey || process.env.SARVAM_API_KEY;
  const secret = customSecret || config.webhookSecret;
  const phone = customPhone || config.sarvamPhoneNumber || process.env.SARVAM_PHONE_NUMBER || '+917971414044';
  if (!sarvamProviderInstance) {
    sarvamProviderInstance = new SarvamVoiceProvider(key, secret, phone);
  }
  return sarvamProviderInstance;
};

/**
 * Provider Factory - Pure Sarvam AI & Vobiz Telephony
 */
export const getVoiceProvider = (org = null) => {
  return getSarvamProvider(
    org?.providerConfig?.sarvamApiKey,
    null,
    org?.providerConfig?.sarvamPhoneNumber || '+917971414044'
  );
};
