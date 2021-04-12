/**
 * Gets a random element from `array`.
 *
 * @param {Array} array The array to sample.
 * @example
 *
 * sample([1, 2, 3, 4])
 * // => 2
 */
export default function sample<T = any>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
