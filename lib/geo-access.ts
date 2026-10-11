const BRAZIL_COUNTRY_CODE = "BR"

export function isBrazilianAccessAllowed(country: string | undefined, enforce: boolean) {
  if (!enforce) return true
  return country?.trim().toUpperCase() === BRAZIL_COUNTRY_CODE
}
