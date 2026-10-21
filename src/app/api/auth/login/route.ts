import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
    const cleanPassword = String(password);

    // 1. Kiểm tra với tài khoản Admin được bảo mật trên Server (.env.local)
    const serverAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const serverAdminPassword = process.env.ADMIN_PASSWORD || "";

    const isServerMatch =
      serverAdminEmail &&
      cleanEmail === serverAdminEmail &&
      cleanPassword === serverAdminPassword;

    if (isServerMatch) {
      const cookieStore = await cookies();
      cookieStore.set("thomas_admin", "1", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        email: cleanEmail,
      });
    }

    // 2. Thử xác thực qua Supabase nếu có cấu hình
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("mock-placeholder")
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
        cookieStore.set("thomas_admin", "1", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({
          success: true,
          email: data.user.email || cleanEmail,
        });
      }
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
