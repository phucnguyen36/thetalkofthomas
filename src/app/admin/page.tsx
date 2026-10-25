"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/database";

const DEFAULT_POSTS: Post[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    created_at: "2026-10-21T00:00:00Z",
    updated_at: "2026-10-21T00:00:00Z",
    title: "Về sự im lặng trong những cuộc đàm phán quan trọng",
    slug: "ve-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong",
    category: "Chiến lược",
    excerpt: "Trong phần lớn các cuộc trò chuyện căng thẳng, người lên tiếng đầu tiên thường là người bộc lộ nhiều điểm yếu nhất. Sự im lặng không đồng nghĩa với bối rối hay nhượng bộ — nó là khoảng dừng cần thiết để quan sát toàn bộ bàn cờ.",
    content: "Trong công việc và kinh doanh, chúng ta rất dễ bị cuốn vào ảo tưởng rằng kẻ nói nhiều nhất, to tiếng nhất là kẻ nắm quyền kiểm soát. Nhưng thực tế thường chứng minh điều ngược lại.\n\nKhi bạn chủ động giữ sự tĩnh lặng, bạn buộc đối phương phải lấp đầy khoảng trống đó bằng lời nói của chính họ. Đó là lúc những sơ hở, sự bất an và mục đích thật sự bắt đầu lộ diện.\n\nKỷ luật không phải là sự gò bó ép buộc, mà là sự tự do tối cao: tự do khỏi những phản ứng bộc phát thiếu suy nghĩ, và khả năng chỉ hành động khi thời điểm thực sự chín muồi.",
    read_time: "5 phút đọc",
    published: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-10-15T00:00:00Z",
    updated_at: "2026-10-15T00:00:00Z",
    title: "Nguyên tắc ra quyết định khi không có đủ dữ liệu",
    slug: "nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu",
    category: "Tư duy",
    excerpt: "Chờ đợi cho đến khi có 100% dữ liệu đồng nghĩa với việc bạn đã bỏ lỡ thời cơ. Những quyết định bước ngoặt trong sự nghiệp luôn đòi hỏi bạn phải chấp nhận rủi ro có tính toán.",
    content: "Sự tê liệt do phân tích quá mức là cái bẫy lớn nhất của trí thức. Cách xây dựng trực giác có căn cứ và chấp nhận rủi ro có tính toán khi thời khắc đến.\n\nNgười lãnh đạo giỏi không phải là người không bao giờ phạm sai lầm, mà là người biết cách đưa ra quyết định dứt khoát trong điều kiện mập mờ và chịu trách nhiệm đến cùng.",
    read_time: "4 phút đọc",
    published: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-08T00:00:00Z",
    title: "Kỷ luật tự thân trong môi trường quá tải thông tin",
    slug: "ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin",
    category: "Tư duy",
    excerpt: "Mỗi ngày có hàng trăm thông báo cố gắng giành lấy sự chú ý của bạn. Khả năng nói không với những kích thích tầm thường là điều kiện tiên quyết để tạo ra kết quả có giá trị.",
    content: "Não bộ con người không được tạo ra để tiếp nhận hàng ngàn kích thích rẻ tiền mỗi ngày. Khả năng nói không là thứ vũ khí quyền năng nhất.\n\nHãy dựng lên một pháo đài tinh thần để bảo vệ năng lượng cho những mục tiêu thật sự dài hạn.",
    read_time: "6 phút đọc",
    published: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    created_at: "2026-09-29T00:00:00Z",
    updated_at: "2026-09-29T00:00:00Z",
    title: "Ghi chép về cách xây dựng vị thế độc lập",
    slug: "ghi-chep-ve-cach-xay-dung-vi-the-doc-lap",
    category: "Ghi chép",
    excerpt: "Sự độc lập không đến từ việc đối đầu với mọi người, mà đến từ việc xây dựng năng lực chuyên môn hiếm hoi và tự chủ về tư duy lẫn tài chính.",
    content: "Độc lập không có nghĩa là đối đầu với tất cả. Độc lập là làm chủ được thời gian, kỹ năng cốt lõi và không bị phụ thuộc vào sự chấp thuận của người khác.",
    read_time: "7 phút đọc",
    published: true,
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
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
            setLoading(false);
            return;
          }
        }
      } catch {
        // fallback
      }

      setPosts([]);
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
        <div className="border border-subtle rounded-lg divide-y border-subtle overflow-hidden">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--card-bg)] transition-colors"
            >
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

              <div className="flex items-center gap-3 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle">
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
      </main>

      <footer className="border-t border-subtle py-6 text-center text-xs text-[var(--muted)]">
        thetalkofthomas © 2026 · Quản trị nội dung
      </footer>
    </div>
  );
}
