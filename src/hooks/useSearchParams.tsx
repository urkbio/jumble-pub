export function useSearchParams() {
  const searchParams = new URLSearchParams(window.location.search)

  return {
    searchParams,
    get: (key: string) => searchParams.get(key),
    set: (key: string, value: string) => {
      searchParams.set(key, value)
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${searchParams.toString()}`
      )
    },
    delete: (key: string) => {
      searchParams.delete(key)
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${searchParams.toString()}`
      )
    }
  }
}
