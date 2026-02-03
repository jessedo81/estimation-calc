import { describe, it, expect } from 'vitest';
import {
  ROOM_TYPE_MULTIPLIERS,
  MINIMUM_JOB_FEE,
  SETUP_CLEANUP_FEE,
} from './constants';

describe('Pricing Constants', () => {
  it('should have correct room type multipliers', () => {
    expect(ROOM_TYPE_MULTIPLIERS.standard).toBe(2.8);
    expect(ROOM_TYPE_MULTIPLIERS.kitchen).toBe(3.1);
    expect(ROOM_TYPE_MULTIPLIERS.bathroom).toBe(4.1);
  });

  it('should have correct minimum job fee', () => {
    expect(MINIMUM_JOB_FEE).toBe(1566);
  });

  it('should have correct setup/cleanup fee', () => {
    expect(SETUP_CLEANUP_FEE).toBe(300);
  });
});
