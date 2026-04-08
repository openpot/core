import { formatDuration } from '@/lib/utils/format-duration';

describe('formatDuration', () => {
  it('formats zero safely', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('pads seconds and minutes', () => {
    expect(formatDuration(125)).toBe('02:05');
  });

  it('keeps counting minutes without overflowing into hours', () => {
    expect(formatDuration(3605)).toBe('60:05');
  });
});
