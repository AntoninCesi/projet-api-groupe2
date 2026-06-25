import { formatCount, timeAgo } from '@/utils/format';

describe('formatCount', () => {
  test('garde les nombres < 1000 tels quels', () => {
    expect(formatCount(0)).toBe(0);
    expect(formatCount(999)).toBe(999);
  });

  test('formate les milliers avec "k"', () => {
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(1500)).toBe('1.5k');
    expect(formatCount(2100)).toBe('2.1k');
  });
});

describe('timeAgo', () => {
  const ago = (ms) => new Date(Date.now() - ms).toISOString();

  test('chaîne vide si pas de date', () => {
    expect(timeAgo(null)).toBe('');
  });

  test('"now" pour quelques secondes', () => {
    expect(timeAgo(ago(5 * 1000))).toBe('now');
  });

  test('minutes / heures / jours', () => {
    expect(timeAgo(ago(5 * 60 * 1000))).toBe('5 min');
    expect(timeAgo(ago(3 * 3600 * 1000))).toBe('3 h');
    expect(timeAgo(ago(2 * 86400 * 1000))).toBe('2 d');
  });
});
