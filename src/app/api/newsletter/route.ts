import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const subFilePath = path.join(process.cwd(), "src", "data", "subscribers.json");

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hợp lệ." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Lưu local file
    try {
      let currentSubs: Array<{ email: string; subscribed_at: string }> = [];
      if (fs.existsSync(subFilePath)) {
        currentSubs = JSON.parse(fs.readFileSync(subFilePath, "utf8"));
      }
      if (!currentSubs.some((s) => s.email === cleanEmail)) {
        currentSubs.push({
          email: cleanEmail,
          subscribed_at: new Date().toISOString(),
        });
        fs.writeFileSync(subFilePath, JSON.stringify(currentSubs, null, 2), "utf8");
      }
    } catch {
      // ignore
    }

    // 2. Lưu Supabase nếu có
    try {
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
            setAll() {},
          },
        });
        await supabase.from("subscribers").upsert({ email: cleanEmail });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi đăng ký nhận tin." },
      { status: 500 }
    );
  }
}
