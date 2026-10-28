"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post } from "@/types/database";
import { CoverImagePicker, ContentImageToolbar } from "@/components/ImageToolbar";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Chiến lược");
  const [readTime, setReadTime] = useState("5 phút đọc");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const newPost: Post = {
      id: crypto.randomUUID ? crypto.randomUUID() : `custom-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title,
      slug,
      category,
      read_time: readTime,
      excerpt,
      content,
      published,
      cover_image: coverImage || undefined,
    };

    // Lưu bài viết qua API server (tự động đồng bộ file JSON server & Supabase)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Không thể lưu bài viết.");
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    router.push("/admin");
  };

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

          <span className="text-xs font-medium text-[var(--text)]">Viết bài mới</span>
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ví dụ: Về sự im lặng trong những cuộc đàm phán quan trọng"
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
                placeholder="ve-su-im-lang"
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
                placeholder="5 phút đọc"
                className="w-full px-3 py-2 rounded border border-subtle bg-transparent text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Cover Image */}
          <CoverImagePicker value={coverImage} onChange={setCoverImage} />

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
              placeholder="Tóm tắt 1-2 câu ngắn gọn về ý nghĩa trọng tâm của bài viết..."
              className="w-full px-3.5 py-2.5 rounded border border-subtle bg-transparent text-sm text-[var(--text)] leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs text-[var(--muted)] font-medium">
                Nội dung toàn văn
              </label>
              <ContentImageToolbar
                onInsertImage={(snippet) => setContent((prev) => prev + snippet)}
              />
            </div>
            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung bài viết ở đây... Bạn có thể dùng Markdown hoặc bấm nút chèn ảnh phía trên."
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
              <span>Xuất bản ngay lên trang chủ</span>
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
                disabled={loading}
                className="px-6 py-2.5 rounded bg-[var(--text)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : published ? "Xuất bản bài viết" : "Lưu bản nháp"}
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
