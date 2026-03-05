import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.toLowerCase();

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forget-password",
    "/reset",
    "/about",
    "/contact",
    "/callback",
    "/role-select",
    "/patients",
    "/doctors",
    "/donors",    "/admin",
  ];

  const isPublicRoute = publicRoutes.includes(path);

  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Allow callback route to proceed without additional checks
  // This is crucial for OAuth flow to complete
  if (path === "/callback") {
    return response;
  }

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Debug logging (remove in production)
  console.log("🔍 Middleware:", {
    path,
    hasUser: !!user,
    isPublicRoute,
    userError: userError?.message,
  });

  // Not logged in → redirect to login for protected routes
  if (!user && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path); // Save original destination
    return NextResponse.redirect(url);
  }

  // User is logged in
  if (user) {
    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    console.log("👤 Profile:", { role: profile?.role, profileError });

    const role = profile?.role?.toLowerCase();

    // User has no role → must complete role selection
    if (!role) {
      // Allow access only to role-select page
      if (path !== "/role-select") {
        const url = req.nextUrl.clone();
        url.pathname = "/role-select";
        return NextResponse.redirect(url);
      }
      return response;
    }

    // User has a role → enforce role-based access
    // Prevent going back to role-select, login, or signup
    if (["/role-select", "/login", "/signup"].includes(path)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${role}`;
      return NextResponse.redirect(url);
    }

    // Check if user is accessing the correct role dashboard
    const roleRoutes = ["/doctor", "/patient", "/donor", "/admin"];
    const accessingRoleRoute = roleRoutes.find((route) =>
      path.startsWith(route)
    );

    // If accessing a role-specific route, ensure it matches their role
    if (accessingRoleRoute && !path.startsWith(`/${role}`)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${role}`;
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};