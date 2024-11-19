import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

export function formatTimestamp(timestamp: number) {
  const { t } = useTranslation()
  const time = dayjs(timestamp * 1000)
  const now = dayjs()

  const diffMonth = now.diff(time, 'month')
  if (diffMonth >= 1) {
    return t('date', { timestamp: time.valueOf() })
  }

  const diffDay = now.diff(time, 'day')
  if (diffDay >= 1) {
    return t('n days ago', { n: diffDay })
  }

  const diffHour = now.diff(time, 'hour')
  if (diffHour >= 1) {
    return t('n hours ago', { n: diffHour })
  }

  const diffMinute = now.diff(time, 'minute')
  if (diffMinute >= 1) {
    return t('n minutes ago', { n: diffMinute })
  }

  return t('just now')
}
