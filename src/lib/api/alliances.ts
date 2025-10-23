import { createApiClient, ApiClient } from './client';
import { Alliance } from '@/types';

export interface AllianceDirectoryResponse {
  alliances: Alliance[];
  invites: Record<string, string>;
  currentAllianceId?: string;
}

/**
 * Retrieves the alliance directory including available invites for the current commander.
 */
export const fetchAllianceDirectory = async (
  client: ApiClient = createApiClient(),
): Promise<AllianceDirectoryResponse> => {
  return client.request<AllianceDirectoryResponse>({ path: '/alliances/directory' });
};
