export interface LocaleCurrency {
  locale: string;
  currency: 'mxn' | 'usd' | 'eur' | 'gbp';
}

const EUR_COUNTRY_CODES = ['-es', '-fr', '-de', '-it', '-pt', '-nl', '-be', '-at', '-fi', '-ie', '-gr'];

export function getLocaleAndCurrency(): LocaleCurrency {
  const locale = navigator.language || 'en-US';
  const clean = locale.toLowerCase();
  let currency: LocaleCurrency['currency'] = 'usd';

  if (clean.includes('-mx')) {
    currency = 'mxn';
  } else if (clean.includes('-gb')) {
    currency = 'gbp';
  } else if (EUR_COUNTRY_CODES.some(code => clean.includes(code))) {
    currency = 'eur';
  }

  return { locale, currency };
}
