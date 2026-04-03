import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import BingoScreen from './screens/BingoScreen.jsx'
import CommunityScreen from './screens/CommunityScreen.jsx'
import NewsScreen from './screens/NewsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
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
      case 'bingo':     return <BingoScreen user={user} onNavigate={setActiveTab} onMenuClick={goToBingo} onProfileClick={goToSettings} />
      case 'community': return <CommunityScreen user={user} onNavigate={setActiveTab} onMenuClick={goToBingo} onProfileClick={goToSettings} />
      case 'news':      return <NewsScreen onNavigate={setActiveTab} onMenuClick={goToBingo} onProfileClick={goToSettings} />
      case 'settings':  return <SettingsScreen user={user} loading={loading} onNavigate={setActiveTab} onMenuClick={goToBingo} onProfileClick={openSettingsMenu} />
      default:          return <BingoScreen user={user} onNavigate={setActiveTab} onMenuClick={goToBingo} onProfileClick={goToSettings} />
    }
  }

  return (
    <div className="relative min-h-screen bg-background font-body">
      {renderScreen()}
      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </div>
  )
}
