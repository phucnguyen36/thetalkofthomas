import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("thomas_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền tải ảnh lên." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy tệp ảnh tải lên." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const contentType = file.type || "image/jpeg";

    // 1. Thử tải lên Supabase Storage bucket 'blog-images' nếu có
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (
        supabaseUrl &&
        supabaseAnonKey &&
        !supabaseUrl.includes("placeholder")
      ) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        });

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("blog-images")
          .upload(fileName, fileBuffer, {
            contentType,
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("blog-images")
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ url: publicUrlData.publicUrl });
          }
        }
      }
    } catch {
      // Fallback to data URI
    }

    // 2. Dự phòng: Chuyển đổi thành Data URI (hoạt động 100% không phụ thuộc bucket ngoài)
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ url: dataUri });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải ảnh lên." },
      { status: 500 }
    );
  }
}
