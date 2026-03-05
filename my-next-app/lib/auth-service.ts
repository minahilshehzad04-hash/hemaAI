import { createSupabaseClient } from "@/lib/supabase/client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SignUpData, UserRole } from '@/types/auth'
import toast from 'react-hot-toast'

export class AuthService {
  
  // ---------------------------
  // EMAIL/PASSWORD SIGNUP
  // ---------------------------
  static async signUp(data: SignUpData) {
    const supabase = createSupabaseClient();
    const { email, password, full_name, role } = data

    if (!role) return { error: { message: 'Role is required' } }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name, role: role.toUpperCase() },
      },
    })

    if (error) return { error, data: null }

    // ✅ Insert into profiles manually
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name,
        role: role.toUpperCase(),
      })
      await supabase.auth.signOut()
    }

    return {
      data: authData,
      error: null,
      message: 'Account created successfully! Please verify your email before logging in.'
    }
  }

  // ---------------------------
  // GOOGLE OAUTH SIGNUP
  // ---------------------------
static async continueWithGoogle() {
  const supabase = createClientComponentClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      // Skip PKCE flow verification if needed (not recommended for production)
      skipBrowserRedirect: false,
    },
  });

  if (error) {
    console.error("Google sign-in error:", error.message);
    return { error };
  }

  return { error: null };
}

  // ---------------------------
  // UPDATE ROLE (For Google users)
  // ---------------------------
  static async updateRole(role: UserRole) {
    const supabase = createSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
      return { error: { message: 'User not authenticated' } }
    }

    // 👇 update via RPC or direct update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: role.toUpperCase() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: { message: 'Failed to update role' } }
    }

    await supabase.auth.refreshSession()
    return { error: null, message: 'Role updated successfully' }
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  // ---------------------------
  static async login(email: string, password: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('🔹 SignIn result:', data, error)
    if (error) { return { error: { message: error.message }, data: null } }
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      return { error: { message: 'Please verify your email first.' }, data: null }
    }
    const { data: profile } = await supabase
      .from('profiles').select('*')
      .eq('id', data.user.id)
      .single()
    return {
      data: { user: data.user, session: data.session, profile },
      error: null
    }
  }
  // ---------------------------
  // PASSWORD RESET
  // ---------------------------
  static async resetPassword(email: string) {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`, // ✅ correct format
    })

    if (error) return { error }
    return { error: null, message: 'Password reset link sent to your email.' }
  }

  // ---------------------------
  // UPDATE PASSWORD
  // ---------------------------
  static async updatePassword(newPassword: string, accessToken?: string) {
    const supabase = createSupabaseClient();

    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: ''
      })
    }

    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error }
    return { data, error: null }
  }


  // ---------------------------
  // GET CURRENT USER
  // ---------------------------
  static async getCurrentUser() {
   const supabase = createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser()

    // Agar user nahi mila to return null
    if (!user) return { user: null, profile: null }

    // ✅ Fix: Agar URL me password reset token hai → temporary session ignore karo
    if (typeof window !== 'undefined' && window.location.pathname === '/reset') {
      return { user: null, profile: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { user, profile }
  }

  // ---------------------------
  // LINK EMAIL/PASSWORD TO GOOGLE ACCOUNT
  // ---------------------------
  static async linkEmailPassword(email: string, password: string) {
    const supabase = createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user || userError) return { error: { message: 'User must be signed in to link accounts' } }

    const { data, error } = await supabase.auth.updateUser({ email, password })
    if (error) return { data: null, error: { message: error.message } }

    return { data, error: null, message: 'Email/password linked successfully!' }
  }

  // ---------------------------
  // SIGN OUT
  // ---------------------------
  static async signOut() {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signOut()
    return { error }
  }
}
