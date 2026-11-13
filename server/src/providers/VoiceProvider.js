/**
 * Abstract Base Class for Voice Infrastructure Providers.
 * Any telephony or AI voice backend (Sarvam, Mock, Twilio, Deepgram, etc.)
 * must implement this contract.
 */
export class VoiceProvider {
  constructor(name = 'base') {
    this.name = name;
  }

  /**
   * Synchronize / Register an AI Employee with the voice provider
   * @param {Object} agent - Full Agent document
   * @returns {Promise<{ providerAgentId: string, status: string, raw?: any }>}
   */
  async createAgent(_agent) {
    throw new Error(`createAgent() not implemented in ${this.name}`);
  }

  /**
   * Update an existing AI Employee on the provider
   * @param {string} providerAgentId
   * @param {Object} agent
   * @returns {Promise<{ success: boolean, raw?: any }>}
   */
  async updateAgent(_providerAgentId, _agent) {
    throw new Error(`updateAgent() not implemented in ${this.name}`);
  }

  /**
   * Delete an agent from the provider
   * @param {string} providerAgentId
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteAgent(_providerAgentId) {
    throw new Error(`deleteAgent() not implemented in ${this.name}`);
  }

  /**
   * Initiate a single phone call (test call or campaign lead call)
   * @param {Object} options
   * @param {string} options.callId - Internal Sahara Call ID
   * @param {Object} options.agent - Agent document
   * @param {Object} options.lead - Target Lead data (phone, name, customData)
   * @param {string} options.orgId - Organization ID
   * @param {string} [options.campaignId] - Optional Campaign ID
   * @returns {Promise<{ providerCallId: string, status: string, raw?: any }>}
   */
  async initiateCall(_options) {
    throw new Error(`initiateCall() not implemented in ${this.name}`);
  }

  /**
   * Start or launch a campaign on the provider
   * @param {Object} options
   * @returns {Promise<{ providerCampaignId: string, status: string }>}
   */
  async startCampaign(_options) {
    throw new Error(`startCampaign() not implemented in ${this.name}`);
  }

  /**
   * Pause a campaign
   * @param {string} providerCampaignId
   * @returns {Promise<{ success: boolean }>}
   */
  async pauseCampaign(_providerCampaignId) {
    throw new Error(`pauseCampaign() not implemented in ${this.name}`);
  }

  /**
   * Resume a paused campaign
   * @param {string} providerCampaignId
   * @returns {Promise<{ success: boolean }>}
   */
  async resumeCampaign(_providerCampaignId) {
    throw new Error(`resumeCampaign() not implemented in ${this.name}`);
  }

  /**
   * Terminate a campaign
   * @param {string} providerCampaignId
   * @returns {Promise<{ success: boolean }>}
   */
  async stopCampaign(_providerCampaignId) {
    throw new Error(`stopCampaign() not implemented in ${this.name}`);
  }

  /**
   * Fetch current status and artifacts for a specific call
   * @param {string} providerCallId
   * @returns {Promise<Object>} Normalized call info
   */
  async getCallDetails(_providerCallId) {
    throw new Error(`getCallDetails() not implemented in ${this.name}`);
  }

  /**
   * Normalize an incoming raw provider webhook into internal standard events:
   * 'CALL_STARTED' | 'CALL_RINGING' | 'CALL_CONNECTED' | 'CALL_IN_PROGRESS' |
   * 'CALL_COMPLETED' | 'CALL_FAILED' | 'TRANSCRIPT_READY' | 'ANALYSIS_READY'
   * @param {Object} rawPayload
   * @param {Object} headers
   * @returns {Object} Normalized event object
   */
  normalizeWebhookEvent(_rawPayload, _headers) {
    throw new Error(`normalizeWebhookEvent() not implemented in ${this.name}`);
  }
}
