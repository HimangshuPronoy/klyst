'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('[Auth] Login error:', error.message)
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard', 'page')
  redirect('/dashboard')
}

export async function signup(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('[Auth] Signup error:', error.message)
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmation is required, Supabase returns a user but no session
  if (signUpData?.user && !signUpData?.session) {
    redirect('/auth/login?error=' + encodeURIComponent('Check your email to confirm your account before logging in.'))
  }

  revalidatePath('/dashboard', 'page')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
