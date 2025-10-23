import { createApiClient, ApiClient } from './client';
import { Alliance, GalaxySystem, Player, PlayerProfile } from '@/types';

export interface DirectorySnapshotResponse {
  systems: GalaxySystem[];
  players: Player[];
  currentPlayerId: string;
  alliances: Pick<Alliance, 'id' | 'color'>[];
}

/**
 * Loads the galaxy directory snapshot containing systems, players and the active commander id.
 */
export const fetchDirectorySnapshot = async (
  client: ApiClient = createApiClient(),
): Promise<DirectorySnapshotResponse> => {
  return client.request<DirectorySnapshotResponse>({ path: '/directory/snapshot' });
};

/**
 * Requests the extended profile information for a single player from the backend.
 */
export const fetchPlayerProfile = async (
  playerId: string,
  client: ApiClient = createApiClient(),
): Promise<PlayerProfile> => {
  return client.request<PlayerProfile>({ path: `/directory/players/${playerId}` });
};
