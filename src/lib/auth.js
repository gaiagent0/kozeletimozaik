import { supabase } from './supabase'

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })

export const signInAnonymously = () =>
  supabase.auth.signInAnonymously()

export const signOut = () => supabase.auth.signOut()

export const signInWithFacebook = () =>
  supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin,
      scopes: 'email,public_profile',
    }
  })
