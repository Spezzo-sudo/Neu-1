import { describe, expect, it } from 'vitest';
import {
  computeQueueSlotTiming,
  hasQueueCapacity,
  partitionBuildQueue,
} from '@/lib/buildQueue';
import { BuildQueueItem } from '@/types';

describe('partitionBuildQueue', () => {
  it('separates completed entries based on the timestamp', () => {
    const queue: BuildQueueItem[] = [
      { entityId: 'a', level: 1, startTime: 0, endTime: 10 },
      { entityId: 'b', level: 1, startTime: 10, endTime: 20 },
    ];
    const { completed, pending } = partitionBuildQueue(queue, 15);
    expect(completed).toHaveLength(1);
    expect(completed[0].entityId).toBe('a');
    expect(pending).toHaveLength(1);
    expect(pending[0].entityId).toBe('b');
  });
});

describe('hasQueueCapacity', () => {
  it('checks whether the queue length is still below the cap', () => {
    const queue: BuildQueueItem[] = [
      { entityId: 'a', level: 1, startTime: 0, endTime: 10 },
    ];
    expect(hasQueueCapacity(queue, 2)).toBe(true);
    expect(hasQueueCapacity(queue, 1)).toBe(false);
  });
});

describe('computeQueueSlotTiming', () => {
  it('starts immediately when the queue is empty', () => {
    const now = Date.now();
    const { startTime, endTime } = computeQueueSlotTiming([], 10, now);
    expect(startTime).toBe(now);
    expect(endTime).toBe(now + 10000);
  });

  it('chains the new order to the end of the queue', () => {
    const now = 10000;
    const queue: BuildQueueItem[] = [
      { entityId: 'a', level: 1, startTime: 0, endTime: 5000 },
      { entityId: 'b', level: 2, startTime: 5000, endTime: 12000 },
    ];
    const { startTime, endTime } = computeQueueSlotTiming(queue, 30, now);
    expect(startTime).toBe(12000);
    expect(endTime).toBe(12000 + 30000);
  });
});
