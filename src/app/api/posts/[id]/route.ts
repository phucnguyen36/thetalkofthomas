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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("thomas_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const currentPosts = getLocalPosts();
    const existingIndex = currentPosts.findIndex((p) => p.id === id);

    let existingPost: Partial<Post> = {};
    if (existingIndex !== -1) {
      existingPost = currentPosts[existingIndex];
    } else {
      // Nếu bài viết nằm trên Supabase mà chưa có trong file local
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")) {
          const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
              setAll() {},
            },
          });
          const { data } = await supabase.from("posts").select("*").eq("id", id).single();
          if (data) {
            existingPost = data;
          }
        }
      } catch {
        // ignore
      }
    }

    const updatedPost: Post = {
      id,
      title: body.title || existingPost.title || "",
      slug: body.slug || existingPost.slug || "",
      category: body.category || existingPost.category || "Ghi chép",
      excerpt: body.excerpt || existingPost.excerpt || "",
      content: body.content || existingPost.content || "",
      read_time: body.read_time || existingPost.read_time || "5 phút đọc",
      published: body.published ?? existingPost.published ?? true,
      cover_image: body.cover_image !== undefined ? body.cover_image : existingPost.cover_image,
      created_at: existingPost.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      currentPosts[existingIndex] = updatedPost;
    } else {
      currentPosts.unshift(updatedPost);
    }
    saveLocalPosts(currentPosts);

    // Cập nhật Supabase nếu có
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
        let { error } = await supabase.from("posts").upsert(updatedPost);
        if (error && (error.code === "42703" || error.message?.includes("cover_image")) && updatedPost.cover_image) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { cover_image, ...postWithoutCover } = updatedPost;
          const retry = await supabase.from("posts").upsert(postWithoutCover);
          error = retry.error;
        }
        if (error) {
          console.error("Supabase upsert error:", error);
          return NextResponse.json(
            { error: "Lỗi cập nhật Supabase: " + error.message },
            { status: 500 }
          );
        }
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật bài viết." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("thomas_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const currentPosts = getLocalPosts();
    const filtered = currentPosts.filter((p) => p.id !== id);
    saveLocalPosts(filtered);

    // Xóa khỏi Supabase nếu có cấu hình
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
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) {
          console.error("Supabase delete error:", error);
          return NextResponse.json(
            { error: "Lỗi cơ sở dữ liệu Supabase: " + error.message },
            { status: 500 }
          );
        }
      }
    } catch (err: any) {
      console.error("Delete exception:", err);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa bài viết." },
      { status: 500 }
    );
  }
}
