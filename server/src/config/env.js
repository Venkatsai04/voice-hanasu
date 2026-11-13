import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raw-sahara-voice',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'raw_sahara_secret_jwt_key_2026_super_secure_access',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'raw_sahara_secret_refresh_jwt_key_2026_super_secure',
  voiceProvider: process.env.VOICE_PROVIDER || 'sarvam',
  mockVoiceProvider: process.env.MOCK_VOICE_PROVIDER === 'true',
  sarvamApiKey: process.env.SARVAM_API_KEY || '',
  sarvamTtsApiKey: process.env.SARVAM_TTS_API_KEY || process.env.SARVAM_API_KEY || '',
  sarvamOrgId: process.env.SARVAM_ORG_ID || '01a07018-e12e-793c-9cdb-f4d350937a8a',
  sarvamWorkspaceId: process.env.SARVAM_WORKSPACE_ID || '01a07018-e133-7c6f-9ea7-f97284e86143',
  sarvamAgentId: process.env.SARVAM_AGENT_ID || 'Call-bot-ag-baceea75-c21e',
  sarvamConnectionId: process.env.SARVAM_CONNECTION_ID || '9eb5d4b7-60-df7af9c8-6801',
  sarvamPhoneNumber: process.env.SARVAM_PHONE_NUMBER || '+917971414044',
  sarvamVoiceSpeaker: process.env.SARVAM_VOICE_SPEAKER || 'priya',
  sarvamLanguageCode: process.env.SARVAM_LANGUAGE_CODE || 'te-IN',
  webhookSecret: process.env.WEBHOOK_SECRET || 'sahara_webhook_secret_signing_key_secure_2026'
};
