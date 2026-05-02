/**
 * @valdyum/shared — barrel export
 *
 * Re-exports all types, constants, and utils for convenient access.
 */

// Types
export * from './types/index.js';
export * from './types/events.js';

// Constants
export { TOPICS } from './constants/topics.js';
export type { Topic } from './constants/topics.js';

// Utils
export { truncateAddress } from './utils/solana.js';
