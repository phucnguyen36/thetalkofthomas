"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Post, Comment } from "@/types/database";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndLoad() {
      // 1. Kiểm tra session đăng nhập
      const localSession = localStorage.getItem("thomas_admin_session");
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          setUserEmail(parsed.email || "");
        } catch {
          // ignore
        }
      } else {
        // Kiểm tra Supabase Auth
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push("/login");
            return;
          }
          setUserEmail(user.email || "");
        } catch {
          router.push("/login");
          return;
        }
      }

      // 2. Tải bài viết từ server API
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data: Post[] = await res.json();
          if (Array.isArray(data)) {
            setPosts(data);
          }
        }
      } catch {
        // fallback
      }

      // 3. Tải danh sách bình luận
      try {
        const resComm = await fetch("/api/comments");
        if (resComm.ok) {
          const commData: Comment[] = await resComm.json();
          if (Array.isArray(commData)) {
            setComments(commData);
          }
        }
      } catch {
        // fallback
      }

      setLoading(false);
    }

    checkAuthAndLoad();
  }, [router, supabase]);

  const handleLogout = async () => {
    localStorage.removeItem("thomas_admin_session");
    document.cookie = "thomas_admin=; path=/; max-age=0";
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  const handleTogglePublish = async (post: Post) => {
    const updatedStatus = !post.published;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: updatedStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Không thể cập nhật trạng thái bài viết.");
        return;
      }

      const updatedPosts = posts.map((p) =>
        p.id === post.id ? { ...p, published: updatedStatus } : p
      );
      setPosts(updatedPosts);
    } catch {
      alert("Đã xảy ra lỗi kết nối khi cập nhật bài viết.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Không thể xóa bài viết.");
        return;
      }

      const updated = posts.filter((p) => p.id !== id);
      setPosts(updated);
    } catch {
      alert("Đã xảy ra lỗi kết nối khi xóa bài viết.");
    }
  };

  const handleDeleteComment = async (id: string, author: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bình luận của "${author}"?`)) return;

    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Không thể xóa bình luận.");
        return;
      }

      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Đã xảy ra lỗi kết nối khi xóa bình luận.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">
        Đang tải bảng quản trị...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="border-b border-subtle">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-8 h-8 rounded-[6px] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center transition-all bg-[var(--card-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <span className="font-garamond text-lg font-semibold text-[var(--accent)] leading-none select-none">
                  T
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 font-garamond text-xl sm:text-[22px] tracking-[-0.025em] text-[var(--text)] select-none">
                <span className="font-normal">The Talk</span>
                <span className="italic font-normal text-lg text-[var(--accent)] px-0.5">of</span>
                <span className="font-normal">Thomas</span>
              </div>
            </Link>
            <span className="text-xs text-[var(--muted)] border-l border-subtle pl-4">
              Khu vực quản trị
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Xem trang chủ &rarr;
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded border border-subtle text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-12 flex-grow w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-normal text-[var(--text)] mb-1">
              Tất cả bài viết ({posts.length})
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Quản lý danh sách bài viết, chỉnh sửa và xuất bản trực tiếp lên trang chủ.
            </p>
          </div>

          <Link
            href="/admin/new"
            className="px-4 py-2 rounded bg-[var(--text)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 self-start"
          >
            <span>+</span>
            <span>Viết bài mới</span>
          </Link>
        </div>

        {/* POSTS LIST */}
        <div className="border border-subtle rounded-lg divide-y border-subtle overflow-hidden mb-14">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--card-bg)] transition-colors"
            >
              <div className="flex items-start gap-4">
                {post.cover_image && (
                  <div className="w-16 h-12 rounded overflow-hidden border border-subtle flex-shrink-0 bg-[var(--bg)] mt-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        post.published
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {post.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {post.category} · {post.read_time}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[var(--text)]">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-1 max-w-xl">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle flex-shrink-0">
                <button
                  onClick={() => handleTogglePublish(post)}
                  className="px-2.5 py-1 rounded border border-subtle text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  {post.published ? "Hạ xuống nháp" : "Xuất bản"}
                </button>
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="px-2.5 py-1 rounded border border-subtle text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="px-2.5 py-1 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="p-12 text-center text-sm text-[var(--muted)]">
              Chưa có bài viết nào. Hãy tạo bài viết đầu tiên của bạn!
            </div>
          )}
        </div>

        {/* COMMENTS MODERATION */}
        <div>
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-normal text-[var(--text)] mb-1">
              Bình luận gần đây ({comments.length})
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Xem và kiểm duyệt các phản hồi của độc giả trên toàn bộ blog.
            </p>
          </div>

          <div className="border border-subtle rounded-lg divide-y border-subtle overflow-hidden">
            {comments.map((comment) => {
              const matchedPost = posts.find((p) => p.id === comment.post_id);
              return (
                <div
                  key={comment.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[var(--card-bg)] transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-[var(--text)]">
                        {comment.author_name}
                      </span>
                      {comment.author_email && (
                        <span className="text-[var(--muted)]">({comment.author_email})</span>
                      )}
                      <span className="text-[var(--muted)]">·</span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--accent)] font-serif">
                      Bài viết: {matchedPost ? matchedPost.title : "ID " + comment.post_id}
                    </div>

                    <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line pt-1">
                      {comment.content}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(comment.id, comment.author_name)}
                    className="px-2.5 py-1 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs transition-colors self-start sm:self-center"
                  >
                    Xóa bình luận
                  </button>
                </div>
              );
            })}

            {comments.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--muted)]">
                Chưa có bình luận nào trên blog.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-subtle py-6 text-center text-xs text-[var(--muted)]">
        thetalkofthomas © 2026 · Quản trị nội dung
      </footer>
    </div>
  );
}
