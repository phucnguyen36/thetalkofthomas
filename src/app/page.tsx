"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    updated_at: "2026-10-21T00:00:00Z",
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
    updated_at: "2026-10-21T00:00:00Z",
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
    updated_at: "2026-10-21T00:00:00Z",
    title: "Ghi chép về cách xây dựng vị thế độc lập",
    slug: "ghi-chep-ve-cach-xay-dung-vi-the-doc-lap",
    category: "Ghi chép",
    excerpt: "Sự độc lập không đến từ việc đối đầu với mọi người, mà đến từ việc xây dựng năng lực chuyên môn hiếm hoi và tự chủ về tư duy lẫn tài chính.",
    content: "Độc lập không có nghĩa là đối đầu với tất cả. Độc lập là làm chủ được thời gian, kỹ năng cốt lõi và không bị phụ thuộc vào sự chấp thuận của người khác.",
    read_time: "7 phút đọc",
    published: true,
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [category, setCategory] = useState("all");
  const [theme, setTheme] = useState("light");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);

  // Khóa cuộn trang khi mở chế độ đọc
  useEffect(() => {
    if (activePost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePost]);

  useEffect(() => {
    // 1. Khởi tạo theme
    const savedTheme = localStorage.getItem("thomas-theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    // 2. Tải bài viết trực tiếp từ API server (đồng bộ tất cả thiết bị & Supabase)
    async function loadPosts() {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data: Post[] = await res.json();
          if (Array.isArray(data)) {
            const published = data.filter((p) => p.published);
            setPosts(published);
            return;
          }
        }
      } catch {
        // fallback
      }
      setPosts([]);
    }

    loadPosts();
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("thomas-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
      localStorage.setItem("thomas-theme", "light");
    }
  };

  const filteredPosts = posts.filter(
    (post) => category === "all" || post.category === category
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return "21.10.2026";
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
    } catch {
      // ignore
    }
    setSubEmail("");
    setSubSuccess(true);
    setTimeout(() => setSubSuccess(false), 4000);
  };

  return (
    <>
      {/* HEADER: LOGO MỚI ẤN TƯỢNG VỚI CON DẤU BESPOKE HALLMARK */}
      <header className="w-full border-b border-subtle">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 h-24 flex items-center justify-between">
          
          {/* LOGO: Phong cách Apple Garamond mềm mại & thanh lịch */}
          <Link href="/" className="group flex items-center gap-3">
            {/* Hallmark Monogram Seal */}
            <div className="w-8 h-8 rounded-[6px] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center transition-all duration-300 relative bg-[var(--card-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <span className="font-garamond text-xl font-semibold text-[var(--accent)] leading-none select-none transition-transform duration-300 group-hover:scale-105">
                T
              </span>
            </div>

            {/* Wordmark: The Talk of Thomas */}
            <div className="flex items-baseline gap-1.5 font-garamond text-2xl sm:text-[27px] tracking-[-0.025em] text-[var(--text)] select-none">
              <span className="font-normal group-hover:text-[var(--accent)] transition-colors">The Talk</span>
              <span className="italic font-normal text-[22px] text-[var(--accent)] transition-opacity px-0.5">of</span>
              <span className="font-normal group-hover:text-[var(--accent)] transition-colors">Thomas</span>
            </div>
          </Link>

          <div className="flex items-center gap-6 sm:gap-8 text-sm">
            <nav className="flex items-center gap-6 text-[var(--muted)]">
              <a href="#articles" className="hover:text-[var(--text)] transition-colors">
                Bài viết
              </a>
              <a href="#about" className="hover:text-[var(--text)] transition-colors">
                Giới thiệu
              </a>
              <a href="#newsletter" className="hover:text-[var(--text)] transition-colors">
                Bản tin
              </a>
            </nav>

            <button
              onClick={toggleTheme}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2.5 py-1 rounded border border-subtle transition-colors"
            >
              {theme === "light" ? "Giao diện tối" : "Giao diện sáng"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO */}
        <section className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-[var(--text)] leading-[1.08] mb-6">
            Tĩnh lặng giữa hỗn loạn.
          </h1>

          <p className="text-[var(--muted)] text-lg sm:text-xl font-normal leading-relaxed max-w-2xl">
            Ghi chép của Thomas về tư duy chiến lược, sự nghiệp và kỷ luật tự thân trong một thế giới quá nhiều tiếng ồn.
          </p>
        </section>

        {/* ARTICLES LIST */}
        <section id="articles" className="max-w-5xl mx-auto px-6 sm:px-10 py-12 border-t border-subtle">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Left sidebar filters */}
            <div className="md:col-span-3 space-y-4">
              <h2 className="text-sm font-medium text-[var(--text)]">Bài viết</h2>
              <div className="flex flex-wrap md:flex-col gap-2 text-sm text-[var(--muted)]">
                <button
                  onClick={() => setCategory("all")}
                  className={`text-left transition-colors ${
                    category === "all" ? "font-medium text-[var(--text)]" : "hover:text-[var(--text)]"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setCategory("Chiến lược")}
                  className={`text-left transition-colors ${
                    category === "Chiến lược" ? "font-medium text-[var(--text)]" : "hover:text-[var(--text)]"
                  }`}
                >
                  Chiến lược
                </button>
                <button
                  onClick={() => setCategory("Tư duy")}
                  className={`text-left transition-colors ${
                    category === "Tư duy" ? "font-medium text-[var(--text)]" : "hover:text-[var(--text)]"
                  }`}
                >
                  Tư duy
                </button>
                <button
                  onClick={() => setCategory("Ghi chép")}
                  className={`text-left transition-colors ${
                    category === "Ghi chép" ? "font-medium text-[var(--text)]" : "hover:text-[var(--text)]"
                  }`}
                >
                  Ghi chép
                </button>
              </div>
            </div>

            {/* Right column list */}
            <div className="md:col-span-9 divide-y border-subtle">
              {filteredPosts.map((post) => (
                <article key={post.id} className="py-8 first:pt-0 group">
                  <div className="text-xs text-[var(--muted)] mb-2">
                    {formatDate(post.created_at)} · {post.category} · {post.read_time}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-3 leading-snug">
                    <button
                      onClick={() => setActivePost(post)}
                      className="text-left hover:underline cursor-pointer"
                    >
                      {post.title}
                    </button>
                  </h3>
                  <p className="text-[var(--muted)] text-base font-normal leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <button
                    onClick={() => setActivePost(post)}
                    className="text-sm font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Đọc tiếp &rarr;
                  </button>
                </article>
              ))}

              {filteredPosts.length === 0 && (
                <div className="py-12 text-sm text-[var(--muted)]">
                  Chưa có bài viết nào trong danh mục này.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="max-w-5xl mx-auto px-6 sm:px-10 py-16 border-t border-subtle">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <h2 className="text-sm font-medium text-[var(--text)]">Giới thiệu</h2>
            </div>
            <div className="md:col-span-9 space-y-4 text-[var(--muted)] text-base leading-relaxed max-w-2xl">
              <p>
                Tôi là Thomas. Tôi tạo ra trang này như một không gian làm việc cá nhân và lưu trữ suy nghĩ, tách biệt khỏi sự ồn ào của mạng xã hội.
              </p>
              <p>
                Tôi viết về những bài học thực tế trong công việc, tư duy chiến lược và cách rèn luyện kỷ luật bản thân.
              </p>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section id="newsletter" className="max-w-5xl mx-auto px-6 sm:px-10 py-16 border-t border-subtle">
          <div className="max-w-xl">
            <h2 className="text-base font-medium text-[var(--text)] mb-2">
              Nhận bài viết qua email
            </h2>
            <p className="text-[var(--muted)] text-sm mb-6 leading-relaxed">
              Tôi gửi bài viết mới trực tiếp đến hòm thư khi có bài mới. Không có email quảng cáo.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder="Địa chỉ email"
                className="flex-1 px-3.5 py-2 rounded border border-subtle bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[var(--text)] text-[var(--bg)] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Đăng ký
              </button>
            </form>
            {subSuccess && (
              <p className="text-xs text-[var(--accent)] mt-3">Đã đăng ký thành công.</p>
            )}
          </div>
        </section>

        {/* CHẾ ĐỘ ĐỌC: ĐỒNG BỘ THEO MODE */}
        {activePost && (
          <div className="fixed inset-0 z-50 reader-backdrop overflow-y-auto p-6 sm:p-12 animate-in fade-in duration-300">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--reader-vignette-outer)_100%)]"></div>

            <div className="relative max-w-2xl mx-auto py-12 sm:py-16">
              <button
                onClick={() => setActivePost(null)}
                className="text-xs text-[var(--muted)] hover:text-[var(--reader-title)] flex items-center gap-2 mb-12 transition-colors cursor-pointer"
              >
                <span>&larr;</span>
                <span>Quay lại danh sách</span>
              </button>

              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[var(--reader-title)] leading-[1.15] mb-4">
                {activePost.title}
              </h1>

              <div className="text-xs text-[var(--muted)] pb-6 mb-8 border-b border-[var(--reader-border)]">
                {formatDate(activePost.created_at)} · {activePost.category} · {activePost.read_time}
              </div>

              <div className="space-y-6 text-base sm:text-lg leading-[1.85] text-[var(--reader-text)] font-normal whitespace-pre-line">
                <p className="text-xl sm:text-2xl font-serif italic text-[var(--accent)] pb-3 leading-relaxed border-l-2 border-[var(--accent)] pl-6 my-6">
                  &ldquo;{activePost.excerpt}&rdquo;
                </p>
                {activePost.content}
              </div>

              <div className="pt-14 mt-14 border-t border-[var(--reader-border)] flex justify-between items-center text-xs text-[var(--muted)]">
                <span className="font-serif text-[var(--accent)] text-sm">thetalkofthomas</span>
                <button
                  onClick={() => setActivePost(null)}
                  className="text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Đóng bài viết &uarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-subtle py-8">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2 font-serif text-sm">
            <span>The Talk</span>
            <span className="italic text-[var(--accent)]">of</span>
            <span>Thomas</span>
            <span className="text-xs text-[var(--muted)] font-sans ml-1">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#articles" className="hover:text-[var(--text)] transition-colors">
              Bài viết
            </a>
            <a href="#about" className="hover:text-[var(--text)] transition-colors">
              Giới thiệu
            </a>
            <Link href="/login" className="hover:text-[var(--text)] transition-colors text-opacity-50">
              Quản trị
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
