const MONTH_NAMES = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
  'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
];

function parseDate(dateStr: string): { month: string; year: string } | null {
  if (!dateStr || dateStr.toLowerCase() === 'present') {
    return null;
  }

  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = Number.parseInt(isoMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  const slashMatch = dateStr.match(/^(\d{4})\/(\d{1,2})$/);
  if (slashMatch) {
    const year = slashMatch[1];
    const monthIndex = Number.parseInt(slashMatch[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const year = usMatch[2];
    const monthIndex = Number.parseInt(usMatch[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  const monthMatch = dateStr.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (monthMatch) {
    const monthAbbr = monthMatch[1].toLowerCase();
    const year = monthMatch[2];
    const monthIndex = MONTH_NAMES.findIndex((month) =>
      month.toLowerCase().replace('.', '').startsWith(monthAbbr)
      || monthAbbr.startsWith(month.toLowerCase().replace('.', '')),
    );

    if (monthIndex !== -1) {
      return { month: MONTH_NAMES[monthIndex], year };
    }
  }

  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return { month: '', year: yearMatch[1] };
  }

  return { month: '', year: dateStr };
}

export function formatDateRange(start: string, end?: string): string {
  const startDate = parseDate(start);
  const endDate = end ? parseDate(end) : null;

  const startStr = startDate
    ? startDate.month
      ? `${startDate.month} ${startDate.year}`
      : startDate.year
    : start;

  const endStr = endDate
    ? endDate.month
      ? `${endDate.month} ${endDate.year}`
      : endDate.year
    : 'Present';

  if (startDate && endDate && startStr === endStr) {
    return startStr;
  }

  return `${startStr} - ${endStr}`;
}
