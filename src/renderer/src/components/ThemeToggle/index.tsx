import { Button } from '@renderer/components/ui/button'
import { useTheme } from '@renderer/providers/ThemeProvider'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ThemeToggle() {
  const { t } = useTranslation()
  const { themeSetting, setThemeSetting } = useTheme()

  return (
    <>
      {themeSetting === 'system' ? (
        <Button
          variant="titlebar"
          size="titlebar"
          onClick={() => setThemeSetting('light')}
          title={t('switch to light theme')}
        >
          <SunMoon />
        </Button>
      ) : themeSetting === 'light' ? (
        <Button
          variant="titlebar"
          size="titlebar"
          onClick={() => setThemeSetting('dark')}
          title={t('switch to dark theme')}
        >
          <Sun />
        </Button>
      ) : (
        <Button
          variant="titlebar"
          size="titlebar"
          onClick={() => setThemeSetting('system')}
          title={t('switch to system theme')}
        >
          <Moon />
        </Button>
      )}
    </>
  )
}
