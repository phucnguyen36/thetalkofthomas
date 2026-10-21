"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/database";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Chiến lược");
  const [readTime, setReadTime] = useState("5 phút đọc");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const posts: Post[] = await res.json();
          const found = posts.find((p) => p.id === postId);
          if (found) {
            setTitle(found.title);
            setSlug(found.slug);
            setCategory(found.category);
            setReadTime(found.read_time);
            setExcerpt(found.excerpt);
            setContent(found.content);
            setPublished(found.published);
            setLoading(false);
            return;
          }
        }
        setErrorMsg("Không tìm thấy bài viết này.");
      } catch {
        setErrorMsg("Lỗi khi tải dữ liệu bài viết.");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          read_time: readTime,
          excerpt,
          content,
          published,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Lỗi khi cập nhật bài viết.");
      } else {
        router.push("/admin");
      }
    } catch {
      setErrorMsg("Không thể lưu cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">
        Đang tải bài viết...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="border-b border-subtle">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Quay lại trang quản trị</span>
          </Link>

          <span className="text-xs font-medium text-[var(--text)]">Chỉnh sửa bài viết</span>
        </div>
      </header>

      {/* FORM */}
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-10 flex-grow w-full">
        {errorMsg && (
          <div className="p-3 mb-6 rounded text-xs bg-red-500/10 border border-red-500/20 text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-2 font-medium">
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded border border-subtle bg-transparent font-serif text-2xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Slug & Category & ReadTime */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded border border-subtle bg-transparent text-xs text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
                Chuyên mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded border border-subtle bg-[var(--bg)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="Chiến lược">Chiến lược</option>
                <option value="Tư duy">Tư duy</option>
                <option value="Ghi chép">Ghi chép</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
                Thời gian đọc
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-3 py-2 rounded border border-subtle bg-transparent text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
              Đoạn tóm tắt (Excerpt)
            </label>
            <textarea
              required
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-subtle bg-transparent text-sm text-[var(--text)] leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
              Nội dung toàn văn
            </label>
            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded border border-subtle bg-transparent text-base text-[var(--text)] leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Publish Checkbox & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-subtle">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text)]">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-subtle text-[var(--accent)] focus:ring-0"
              />
              <span>Trạng thái xuất bản công khai</span>
            </label>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded bg-[var(--text)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Cập nhật bài viết"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <footer className="border-t border-subtle py-6 text-center text-xs text-[var(--muted)]">
        thetalkofthomas © 2026
      </footer>
    </div>
  );
}
