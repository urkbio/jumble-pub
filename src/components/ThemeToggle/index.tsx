import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/ThemeProvider'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ThemeToggle({
  variant = 'titlebar'
}: {
  variant?: 'titlebar' | 'small-screen-titlebar'
}) {
  const { t } = useTranslation()
  const { themeSetting, setThemeSetting } = useTheme()

  return (
    <>
      {themeSetting === 'system' ? (
        <Button
          variant={variant}
          size={variant}
          onClick={() => setThemeSetting('light')}
          title={t('switch to light theme')}
        >
          <SunMoon />
        </Button>
      ) : themeSetting === 'light' ? (
        <Button
          variant={variant}
          size={variant}
          onClick={() => setThemeSetting('dark')}
          title={t('switch to dark theme')}
        >
          <Sun />
        </Button>
      ) : (
        <Button
          variant={variant}
          size={variant}
          onClick={() => setThemeSetting('system')}
          title={t('switch to system theme')}
        >
          <Moon />
        </Button>
      )}
    </>
  )
}
