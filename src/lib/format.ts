const currencyConfig = {
  locale: "en-PK",
  symbol: "Rs.",
} as const;

const priceFormatter = new Intl.NumberFormat(currencyConfig.locale, {
  maximumFractionDigits: 0,
});

/** Formats whole rupees as "Rs. 12,500", the way campus fees are shown. */
export function formatPrice(amountInRupees: number): string {
  return `${currencyConfig.symbol} ${priceFormatter.format(amountInRupees)}`;
}

/** Joins class names, skipping falsy values. */
export function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
