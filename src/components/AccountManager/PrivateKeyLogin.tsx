import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNostr } from '@/providers/NostrProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PrivateKeyLogin({
  back,
  onLoginSuccess
}: {
  back: () => void
  onLoginSuccess: () => void
}) {
  return (
    <Tabs defaultValue="nsec">
      <TabsList>
        <TabsTrigger value="nsec">nsec</TabsTrigger>
        <TabsTrigger value="ncryptsec">ncryptsec</TabsTrigger>
      </TabsList>
      <TabsContent value="nsec">
        <NsecLogin back={back} onLoginSuccess={onLoginSuccess} />
      </TabsContent>
      <TabsContent value="ncryptsec">
        <NcryptsecLogin back={back} onLoginSuccess={onLoginSuccess} />
      </TabsContent>
    </Tabs>
  )
}

function NsecLogin({ back, onLoginSuccess }: { back: () => void; onLoginSuccess: () => void }) {
  const { t } = useTranslation()
  const { nsecLogin } = useNostr()
  const [nsecOrHex, setNsecOrHex] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsecOrHex(e.target.value)
    setErrMsg(null)
  }

  const handleLogin = () => {
    if (nsecOrHex === '') return

    nsecLogin(nsecOrHex, password)
      .then(() => onLoginSuccess())
      .catch((err) => {
        setErrMsg(err.message)
      })
  }

  return (
    <div className="space-y-4">
      <div className="text-orange-400">
        {t(
          'Using private key login is insecure. It is recommended to use a browser extension for login, such as alby, nostr-keyx or nos2x.'
        )}
      </div>
      <div className="space-y-1">
        <div className="text-muted-foreground text-sm font-semibold">nsec or hex</div>
        <Input
          type="password"
          placeholder="nsec1.. or hex"
          value={nsecOrHex}
          onChange={handleInputChange}
          className={errMsg ? 'border-destructive' : ''}
        />
        {errMsg && <div className="text-xs text-destructive pl-3">{errMsg}</div>}
      </div>
      <div className="space-y-1">
        <div className="text-muted-foreground text-sm font-semibold">{t('password')}</div>
        <Input
          type="password"
          placeholder={t('optional: encrypt nsec')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button className="w-full" onClick={handleLogin}>
        {t('Login')}
      </Button>
      <Button className="w-full" variant="secondary" onClick={back}>
        {t('Back')}
      </Button>
    </div>
  )
}

function NcryptsecLogin({
  back,
  onLoginSuccess
}: {
  back: () => void
  onLoginSuccess: () => void
}) {
  const { t } = useTranslation()
  const { ncryptsecLogin } = useNostr()
  const [ncryptsec, setNcryptsec] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNcryptsec(e.target.value)
    setErrMsg(null)
  }

  const handleLogin = () => {
    if (ncryptsec === '') return

    ncryptsecLogin(ncryptsec)
      .then(() => onLoginSuccess())
      .catch((err) => {
        setErrMsg(err.message)
      })
  }

  return (
    <div className="space-y-4">
      <div className="text-orange-400">
        {t(
          'Using private key login is insecure. It is recommended to use a browser extension for login, such as alby, nostr-keyx or nos2x.'
        )}
      </div>
      <div className="space-y-1">
        <Input
          type="password"
          placeholder="ncryptsec1.."
          value={ncryptsec}
          onChange={handleInputChange}
          className={errMsg ? 'border-destructive' : ''}
        />
        {errMsg && <div className="text-xs text-destructive pl-3">{errMsg}</div>}
      </div>
      <Button className="w-full" onClick={handleLogin}>
        {t('Login')}
      </Button>
      <Button className="w-full" variant="secondary" onClick={back}>
        {t('Back')}
      </Button>
    </div>
  )
}
