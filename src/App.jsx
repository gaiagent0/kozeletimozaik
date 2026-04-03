import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import BingoScreen from './screens/BingoScreen.jsx'
import CommunityScreen from './screens/CommunityScreen.jsx'
import NewsScreen from './screens/NewsScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'

const SCREENS = {
  bingo: BingoScreen,
  community: CommunityScreen,
  news: NewsScreen,
  settings: SettingsScreen,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('bingo')
  const Screen = SCREENS[activeTab]

  return (
    <div className="relative min-h-screen bg-background font-body">
      <Screen />
      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </div>
  )
}
