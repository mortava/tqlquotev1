export function displayOrBlank(value: number | string | undefined | null, format: 'currency' | 'percent' | 'ratio' | 'text' = 'currency'): string {
  if (value === undefined || value === null || value === '' || value === 0) return '';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  switch (format) {
    case 'currency':
      return num < 0
        ? `-$${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'percent':
      return `${(num * 100).toFixed(2)}%`;
    case 'ratio':
      return num.toFixed(2);
    case 'text':
      return String(value);
    default:
      return String(value);
  }
}

export function displayRate(value: number | ''): string {
  if (value === '' || value === 0) return '';
  return `${(value * 100).toFixed(3)}%`;
}
