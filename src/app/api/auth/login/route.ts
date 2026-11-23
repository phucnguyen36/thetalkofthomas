import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  safeEqual,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Kiểm tra với tài khoản Admin cấu hình qua biến môi trường trên Server
    const serverAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const serverAdminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (serverAdminEmail && serverAdminPassword) {
      const isServerMatch =
        safeEqual(cleanEmail, serverAdminEmail) &&
        safeEqual(cleanPassword, serverAdminPassword);

      if (isServerMatch) {
        const sessionToken = createAdminSessionToken(cleanEmail);
        if (!sessionToken) {
          return NextResponse.json(
            { error: "Chưa cấu hình khóa bảo mật phiên đăng nhập trên server." },
            { status: 500 }
          );
        }

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: SESSION_MAX_AGE_SECONDS,
        });

        return NextResponse.json({
          success: true,
          email: cleanEmail,
        });
      }
    }

    // 2. Thử xác thực qua Supabase nếu có cấu hình
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder")
    ) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data.user) {
        const userEmail = data.user.email || cleanEmail;
        const sessionToken = createAdminSessionToken(userEmail);
        if (!sessionToken) {
          return NextResponse.json(
            { error: "Chưa cấu hình SESSION_SECRET trên server." },
            { status: 500 }
          );
        }

        cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: SESSION_MAX_AGE_SECONDS,
        });

        return NextResponse.json({
          success: true,
          email: userEmail,
        });
      }
    }

    if (!serverAdminEmail || !serverAdminPassword) {
      return NextResponse.json(
        {
          error:
            "Chưa cấu hình ADMIN_EMAIL và ADMIN_PASSWORD trong biến môi trường server.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Email hoặc mật khẩu không chính xác." },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình xác thực." },
      { status: 500 }
    );
  }
}
