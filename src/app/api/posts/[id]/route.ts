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

    if (existingIndex === -1) {
      return NextResponse.json(
        { error: "Không tìm thấy bài viết." },
        { status: 404 }
      );
    }

    const updatedPost: Post = {
      ...currentPosts[existingIndex],
      ...body,
      id,
      updated_at: new Date().toISOString(),
    };

    currentPosts[existingIndex] = updatedPost;
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
        await supabase.from("posts").upsert(updatedPost);
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

    // Xóa khỏi Supabase nếu có
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
        await supabase.from("posts").delete().eq("id", id);
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa bài viết." },
      { status: 500 }
    );
  }
}
