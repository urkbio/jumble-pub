export const toHome = () => '/'
export const toNote = (eventId: string) => `/notes/${eventId}`
export const toNoteList = ({
  hashtag,
  search,
  relay
}: {
  hashtag?: string
  search?: string
  relay?: string
}) => {
  const path = '/notes'
  const query = new URLSearchParams()
  if (hashtag) query.set('t', hashtag.toLowerCase())
  if (search) query.set('s', search)
  if (relay) query.set('relay', relay)
  return `${path}?${query.toString()}`
}
export const toProfile = (pubkey: string) => `/users/${pubkey}`
export const toProfileList = ({ search }: { search?: string }) => {
  const path = '/users'
  const query = new URLSearchParams()
  if (search) query.set('s', search)
  return `${path}?${query.toString()}`
}
export const toFollowingList = (pubkey: string) => `/users/${pubkey}/following`
export const toRelaySettings = () => '/relay-settings'
export const toNotifications = () => '/notifications'

export const toNoStrudelProfile = (id: string) => `https://nostrudel.ninja/#/u/${id}`
export const toNoStrudelNote = (id: string) => `https://nostrudel.ninja/#/n/${id}`
export const toNoStrudelArticle = (id: string) => `https://nostrudel.ninja/#/articles/${id}`
export const toNoStrudelStream = (id: string) => `https://nostrudel.ninja/#/streams/${id}`
