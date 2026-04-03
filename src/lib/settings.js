const DEFAULTS = { notifs: true, haptic: false, sounds: true }

export function getSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('app_settings') || '{}') }
  } catch { return DEFAULTS }
}

export function saveSettings(settings) {
  localStorage.setItem('app_settings', JSON.stringify(settings))
}

export function vibrate(pattern = [50]) {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

export function playSound(type = 'tap') {
  const settings = getSettings()
  if (!settings.sounds) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (type === 'tap') {
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    }
    if (type === 'bingo') {
      osc.frequency.value = 1200
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    }
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {}
}

export async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}
