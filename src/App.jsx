import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import BingoScreen from './screens/BingoScreen.jsx'
import CommunityScreen from './screens/CommunityScreen.jsx'
import NewsScreen from './screens/NewsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import AdminScreen from './screens/AdminScreen.jsx'
import { useAuth } from './hooks/useAuth.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('bingo')
  const { user, loading } = useAuth()

  const goToBingo = () => setActiveTab('bingo')
  const goToSettings = () => setActiveTab('settings')

  const openSettingsMenu = () => {
    const choice = window.confirm('Névjegy\n\nVálassz:\nOK → Névjegy\nMégse → Visszajelzés küldése')
    if (choice) {
      alert('Választási Bingó 2026\n\nKészült szórakoztatási céllal.\n\nFejlesztő: GaiAgent')
    } else {
      window.open('mailto:szechist@gmail.com?subject=Bingó visszajelzés', '_blank')
    }
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'bingo':
        return (
          <BingoScreen
            user={user}
            onNavigate={setActiveTab}
            onMenuClick={null}
            onProfileClick={goToSettings}
          />
        )
      case 'community':
        return (
          <CommunityScreen
            user={user}
            onNavigate={setActiveTab}
            onMenuClick={goToBingo}
            onProfileClick={goToSettings}
            leftIcon="home"
          />
        )
      case 'news':
        return (
          <NewsScreen
            onNavigate={setActiveTab}
            onMenuClick={goToBingo}
            onProfileClick={goToSettings}
            leftIcon="home"
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            user={user}
            loading={loading}
            onNavigate={setActiveTab}
            onMenuClick={goToBingo}
            onProfileClick={openSettingsMenu}
            leftIcon="home"
          />
        )
      // Admin – rejtett útvonal, URL-ben: ?admin=1 vagy navigációból
      case 'admin':
        return (
          <AdminScreen
            user={user}
            onMenuClick={goToBingo}
          />
        )
      default:
        return (
          <BingoScreen
            user={user}
            onNavigate={setActiveTab}
            onMenuClick={null}
            onProfileClick={goToSettings}
          />
        )
    }
  }

  return (
    <div className="relative min-h-screen bg-background font-body">
      {renderScreen()}
      <BottomNav active={activeTab} onNavigate={setActiveTab} />
      {/* Admin gyorsgomb – csak bejelentkezett admin látja */}
      {user?.email === 'szechist@gmail.com' && activeTab !== 'admin' && (
        <button
          onClick={() => setActiveTab('admin')}
          className="fixed top-4 left-4 z-50 bg-primary text-on-primary text-[10px] font-headline font-bold px-3 py-1.5 rounded-full shadow-lg opacity-70 active:opacity-100"
        >
          ⚙️ Admin
        </button>
      )}
    </div>
  )
}
