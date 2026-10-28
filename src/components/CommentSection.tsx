"use client";

import { useEffect, useState } from "react";
import { Comment } from "@/types/database";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const res = await fetch(`/api/comments?post_id=${postId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setComments(data);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author_name: name,
          author_email: email,
          content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Không thể gửi bình luận.");
      } else {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [...prev, data.comment]);
        }
        setContent("");
        setSuccessMsg("Bình luận của bạn đã được đăng thành công.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Lỗi kết nối khi gửi bình luận.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="pt-12 mt-14 border-t border-[var(--reader-border)]">
      {/* HEADER BÌNH LUẬN */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl font-normal text-[var(--reader-title)]">
            Bình luận
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
            {comments.length}
          </span>
        </div>
        <span className="text-xs text-[var(--muted)]">Chia sẻ góc nhìn & thảo luận</span>
      </div>

      {/* DANH SÁCH BÌNH LUẬN HIỆN CÓ */}
      <div className="space-y-6 mb-12">
        {loading ? (
          <div className="py-6 text-center text-xs text-[var(--muted)]">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 px-6 rounded-lg border border-[var(--reader-border)] text-center text-xs text-[var(--muted)] bg-[var(--bg)]/30">
            Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
          </div>
        ) : (
          comments.map((comment) => {
            const initial = comment.author_name ? comment.author_name.charAt(0).toUpperCase() : "?";
            return (
              <div
                key={comment.id}
                className="p-5 rounded-lg border border-[var(--reader-border)] bg-[var(--card-bg)]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-serif text-sm font-semibold select-none">
                      {initial}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--reader-title)]">
                        {comment.author_name}
                      </div>
                      <div className="text-[11px] text-[var(--muted)]">
                        {formatCommentDate(comment.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-[var(--reader-text)] leading-relaxed whitespace-pre-line pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* FORM GỬI BÌNH LUẬN MỚI */}
      <div className="p-6 sm:p-7 rounded-xl border border-[var(--reader-border)] bg-[var(--card-bg)]/60 backdrop-blur-sm">
        <h4 className="font-serif text-lg font-normal text-[var(--reader-title)] mb-1">
          Để lại suy nghĩ của bạn
        </h4>
        <p className="text-xs text-[var(--muted)] mb-5">
          Email của bạn sẽ không bao giờ được hiển thị công khai.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded text-xs bg-red-500/10 border border-red-500/20 text-red-500">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded text-xs bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
                Tên hoặc biệt danh <span className="text-[var(--accent)]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Hoàng Long"
                className="w-full px-3.5 py-2 rounded-md border border-[var(--reader-border)] bg-transparent text-sm text-[var(--reader-title)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
                Email (tùy chọn)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2 rounded-md border border-[var(--reader-border)] bg-transparent text-sm text-[var(--reader-title)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
              Nội dung bình luận <span className="text-[var(--accent)]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ quan điểm, phản hồi hoặc câu hỏi của bạn..."
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--reader-border)] bg-transparent text-sm text-[var(--reader-title)] placeholder:text-[var(--muted)]/50 leading-relaxed focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || !name.trim() || !content.trim()}
              className="px-5 py-2 rounded-md bg-[var(--text)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi bình luận</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
