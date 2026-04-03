import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useDailyChallenge(user) {
  const [challenge, setChallenge] = useState(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const today = new Date().toLocaleDateString('sv-SE')
    supabase.from('daily_challenges')
      .select('*')
      .eq('date', today)
      .eq('active', true)
      .maybeSingle()
      .then(({ data }) => { if (data) setChallenge(data) })
  }, [])

  const checkChallenge = (selectedWords) => {
    if (!challenge || completed) return false
    const matches = challenge.target_words.filter(w => selectedWords.includes(w))
    if (matches.length >= challenge.min_matches) {
      setCompleted(true)
      if (user) {
        supabase.from('profiles').update({
          total_points: supabase.rpc('increment_points', { user_id: user.id, amount: challenge.bonus_points })
        }).eq('id', user.id)
      }
      return true
    }
    return false
  }

  return { challenge, completed, checkChallenge }
}
