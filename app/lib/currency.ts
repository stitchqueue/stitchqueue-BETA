export function getCurrencySymbol(currencyCode: string): string {
  switch (currencyCode) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'PEN': return 'S/';
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'MXN':
    default: return '$';
  }
}
