import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { IS_ELECTRON, isElectron } from '@renderer/lib/env'
import { useNostr } from '@renderer/providers/NostrProvider'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PrivateKeyLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { t } = useTranslation()
  const { nsecLogin } = useNostr()
  const [nsec, setNsec] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [storageBackend, setStorageBackend] = useState('unknown')

  useEffect(() => {
    const init = async () => {
      if (!isElectron(window)) return

      const backend = await window.api.system.getSelectedStorageBackend()
      setStorageBackend(backend)
    }
    init()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(e.target.value)
    setErrMsg(null)
  }

  const handleLogin = () => {
    if (nsec === '') return

    nsecLogin(nsec)
      .then(() => onLoginSuccess())
      .catch((err) => {
        setErrMsg(err.message)
      })
  }

  return (
    <>
      <div className="text-orange-400">
        {!IS_ELECTRON
          ? t(
              'Using private key login is insecure. It is recommended to use a browser extension for login, such as alby, nostr-keyx or nos2x.'
            )
          : ['unknown', 'basic_text'].includes(storageBackend)
            ? t('There are no secret keys stored on this device. Your nsec will be unprotected.')
            : t('Your nsec will be encrypted using the {{backend}}.', {
                backend: storageBackend
              })}
      </div>
      <div className="space-y-1">
        <Input
          type="password"
          placeholder="nsec1.."
          value={nsec}
          onChange={handleInputChange}
          className={errMsg ? 'border-destructive' : ''}
        />
        {errMsg && <div className="text-xs text-destructive pl-3">{errMsg}</div>}
      </div>
      <Button onClick={handleLogin}>{t('Login')}</Button>
    </>
  )
}
