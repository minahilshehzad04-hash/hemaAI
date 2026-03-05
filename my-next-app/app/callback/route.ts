import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=no_code`);
  }

  const cookieStore = await cookies();
  
  // Create server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Exchange OAuth code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("OAuth exchange error:", error);
    return NextResponse.redirect(`${url.origin}/login?error=exchange_failed`);
  }

  const user = data.session.user;

  // Fetch or create profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "New User",
      role: null,
    });
  }

  // Redirect based on role
  const redirectUrl = profile?.role 
    ? `${url.origin}/${profile.role.toLowerCase()}` 
    : `${url.origin}/role-select`;

  return NextResponse.redirect(redirectUrl);
}