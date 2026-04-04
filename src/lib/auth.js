import { supabase } from './supabase'

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://valasztasibingo.hu' }
  })

export const signInAnonymously = () =>
  supabase.auth.signInAnonymously()

export const signOut = () => supabase.auth.signOut()

export const signInWithFacebook = () =>
  supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: 'https://valasztasibingo.hu',
    }
  })
