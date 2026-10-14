import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDateRange } from './date-utils';

test('shows matching months only once, including equivalent formats', () => {
  assert.equal(formatDateRange('2025-11', '2025-11'), 'Nov. 2025');
  assert.equal(formatDateRange('2025-09', 'September 2025'), 'Sept. 2025');
});

test('preserves distinct months, years, and ongoing ranges', () => {
  assert.equal(formatDateRange('2026-02', '2026-03'), 'Feb. 2026 - Mar. 2026');
  assert.equal(formatDateRange('2025-11', '2026-11'), 'Nov. 2025 - Nov. 2026');
  assert.equal(formatDateRange('2026-02', 'Present'), 'Feb. 2026 - Present');
  assert.equal(formatDateRange('2026-02'), 'Feb. 2026 - Present');
});
