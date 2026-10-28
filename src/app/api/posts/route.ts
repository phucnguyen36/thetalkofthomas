import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { Post } from "@/types/database";
import { createServerClient } from "@supabase/ssr";

const dataFilePath = path.join(process.cwd(), "src", "data", "posts.json");

function getLocalPosts(): Post[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(fileData);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalPosts(posts: Post[]) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(posts, null, 2), "utf8");
  } catch {
    // ignore
  }
}

export async function GET() {
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

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        // Hợp nhất cover_image từ file local dự phòng nếu database Supabase chưa bổ sung cột này
        const localPosts = getLocalPosts();
        const merged = data.map((sp) => {
          const lp = localPosts.find((p) => p.id === sp.id || p.slug === sp.slug);
          return {
            ...sp,
            cover_image: sp.cover_image || lp?.cover_image,
          };
        });
        return NextResponse.json(merged);
      }
    }
  } catch {
    // ignore and fallback to local
  }

  const localPosts = getLocalPosts();
  return NextResponse.json(localPosts);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("thomas_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 401 }
      );
    }

    const postData = await request.json();
    if (!postData.title || !postData.slug || !postData.content) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tiêu đề, đường dẫn và nội dung." },
        { status: 400 }
      );
    }

    const newPost: Post = {
      id: postData.id || (crypto.randomUUID ? crypto.randomUUID() : `custom-${Date.now()}`),
      created_at: postData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: postData.title,
      slug: postData.slug,
      category: postData.category || "Ghi chép",
      excerpt: postData.excerpt || "",
      content: postData.content,
      read_time: postData.read_time || "5 phút đọc",
      published: postData.published ?? true,
      cover_image: postData.cover_image || undefined,
    };

    // 1. Lưu vào file JSON trên server
    const currentPosts = getLocalPosts();
    const filtered = currentPosts.filter((p) => p.id !== newPost.id && p.slug !== newPost.slug);
    const updated = [newPost, ...filtered];
    saveLocalPosts(updated);

    // 2. Lưu vào Supabase nếu có cấu hình
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
        let { error } = await supabase.from("posts").upsert(newPost);
        if (error && (error.code === "42703" || error.message?.includes("cover_image")) && newPost.cover_image) {
          // Nếu cột cover_image chưa được tạo trên Supabase, lưu tạm không kèm cột này
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { cover_image, ...postWithoutCover } = newPost;
          const retry = await supabase.from("posts").upsert(postWithoutCover);
          error = retry.error;
        }
        if (error) {
          console.error("Supabase insert error:", error);
          return NextResponse.json(
            { error: "Lỗi lưu Supabase: " + error.message },
            { status: 500 }
          );
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo bài viết." },
      { status: 500 }
    );
  }
}
