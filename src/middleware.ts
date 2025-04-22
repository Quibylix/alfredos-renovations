import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/features/db/supabase/middleware.util";
import { getProtectionInfo } from "@/features/auth/protected-routes/get-protection-info.util";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const userId = user?.id ?? null;
  const pathname = request.nextUrl.pathname;

  const { allowed, url: redirectionURL } = await getProtectionInfo(
    userId,
    pathname,
  );

  if (allowed) return supabaseResponse;

  const url = request.nextUrl.clone();
  url.pathname = redirectionURL;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
