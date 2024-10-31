import 'yet-another-react-lightbox/styles.css'
import './assets/main.css'

import { ThemeProvider } from '@renderer/components/theme-provider'
import { Toaster } from '@renderer/components/ui/toaster'
import { PageManager } from './PageManager'
import NoteListPage from './pages/primary/NoteListPage'
import HashtagPage from './pages/secondary/HashtagPage'
import NotePage from './pages/secondary/NotePage'
import ProfilePage from './pages/secondary/ProfilePage'

const routes = [
  { pageName: 'note', element: <NotePage /> },
  { pageName: 'profile', element: <ProfilePage /> },
  { pageName: 'hashtag', element: <HashtagPage /> }
]

export default function App(): JSX.Element {
  return (
    <div className="h-screen">
      <ThemeProvider>
        <PageManager routes={routes}>
          <NoteListPage />
        </PageManager>
        <Toaster />
      </ThemeProvider>
    </div>
  )
}
