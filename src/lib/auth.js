import { supabase } from './supabase'

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://valasztasibingo.hu' }
  })

export const signInAnonymously = () =>
  supabase.auth.signInAnonymously()

export const signOut = () => supabase.auth.signOut()

// Csak public_profile-t kérünk – nem kell App Review az email permissionhöz
// A Supabase "Allow users without email" be van kapcsolva, így ez működik
export const signInWithFacebook = () =>
  supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: 'https://valasztasibingo.hu',
      scopes: 'public_profile',
    }
  })
