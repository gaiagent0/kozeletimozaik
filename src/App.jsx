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

  const goToSettings = () => setActiveTab('settings')

  const renderScreen = () => {
    switch (activeTab) {
      case 'bingo':     return <BingoScreen user={user} onNavigate={setActiveTab} />
      case 'community': return <CommunityScreen user={user} onNavigate={setActiveTab} />
      case 'news':      return <NewsScreen onNavigate={setActiveTab} />
      case 'settings':  return <SettingsScreen user={user} loading={loading} onNavigate={setActiveTab} />
      default:          return <BingoScreen user={user} onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="relative min-h-screen bg-background font-body">
      {renderScreen({ goToSettings })}
      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </div>
  )
}
