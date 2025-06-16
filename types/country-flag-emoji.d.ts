declare module 'country-flag-emoji' {
  interface CountryEmoji {
    code: string
    unicode: string
    name: string
    emoji: string
  }

  const countryFlagEmoji: {
    get: (countryCode: string) => CountryEmoji | undefined
    all: CountryEmoji[]
  }

  export = countryFlagEmoji
}
