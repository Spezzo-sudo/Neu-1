import { BuildQueueItem } from '@/types';

/**
 * Result structure when separating finished and pending build queue entries.
 */
export interface QueuePartition {
  completed: BuildQueueItem[];
  pending: BuildQueueItem[];
}

/**
 * Splits the current build queue into completed and pending items based on a timestamp.
 */
export const partitionBuildQueue = (
  queue: BuildQueueItem[],
  timestamp: number,
): QueuePartition => {
  const completed: BuildQueueItem[] = [];
  const pending: BuildQueueItem[] = [];
  queue.forEach((item) => {
    if (timestamp >= item.endTime) {
      completed.push(item);
    } else {
      pending.push(item);
    }
  });
  return { completed, pending };
};

/**
 * Indicates whether there is enough capacity to enqueue another build order.
 */
export const hasQueueCapacity = (queue: BuildQueueItem[], maxLength: number): boolean =>
  queue.length < maxLength;

/**
 * Determines the start and end timestamps for a newly enqueued build item.
 */
export const computeQueueSlotTiming = (
  queue: BuildQueueItem[],
  durationSeconds: number,
  now: number,
): Pick<BuildQueueItem, 'startTime' | 'endTime'> => {
  const lastEndTime = queue.length > 0 ? queue[queue.length - 1].endTime : now;
  const startTime = Math.max(now, lastEndTime);
  const endTime = startTime + durationSeconds * 1000;
  return { startTime, endTime };
};
