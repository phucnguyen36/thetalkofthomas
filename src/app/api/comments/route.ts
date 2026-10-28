import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { Comment } from "@/types/database";
import { createServerClient } from "@supabase/ssr";

const commentsFilePath = path.join(process.cwd(), "src", "data", "comments.json");

function getLocalComments(): Comment[] {
  try {
    if (fs.existsSync(commentsFilePath)) {
      const fileData = fs.readFileSync(commentsFilePath, "utf8");
      return JSON.parse(fileData);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalComments(comments: Comment[]) {
  try {
    fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2), "utf8");
  } catch {
    // ignore
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("post_id");

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

      let query = supabase.from("comments").select("*").order("created_at", { ascending: true });
      if (postId) {
        query = query.eq("post_id", postId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Fallback to local
  }

  let local = getLocalComments();
  if (postId) {
    local = local.filter((c) => c.post_id === postId);
  }
  return NextResponse.json(local);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, author_name, author_email, content } = body;

    if (!post_id || !author_name?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên và nội dung bình luận." },
        { status: 400 }
      );
    }

    const trimmedName = author_name.trim().slice(0, 50);
    const trimmedEmail = author_email ? author_email.trim().slice(0, 100) : "";
    const trimmedContent = content.trim().slice(0, 2000);

    const newComment: Comment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `comment-${Date.now()}`,
      post_id,
      author_name: trimmedName,
      author_email: trimmedEmail || undefined,
      content: trimmedContent,
      created_at: new Date().toISOString(),
    };

    // 1. Lưu vào file json local
    const local = getLocalComments();
    local.push(newComment);
    saveLocalComments(local);

    // 2. Thử lưu vào Supabase nếu có bảng comments
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

        await supabase.from("comments").insert({
          id: newComment.id,
          post_id: newComment.post_id,
          author_name: newComment.author_name,
          author_email: newComment.author_email || null,
          content: newComment.content,
          created_at: newComment.created_at,
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng bình luận." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("thomas_admin");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Thiếu ID bình luận." },
        { status: 400 }
      );
    }

    // 1. Xóa khỏi local file
    const local = getLocalComments();
    const updated = local.filter((c) => c.id !== commentId);
    saveLocalComments(updated);

    // 2. Xóa khỏi Supabase
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
        await supabase.from("comments").delete().eq("id", commentId);
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa bình luận." },
      { status: 500 }
    );
  }
}
