import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12">
      <header className="max-w-xl mx-auto w-full pt-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center transition-colors bg-[var(--card-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="font-garamond text-lg font-semibold text-[var(--accent)] leading-none select-none">
              T
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 font-garamond text-2xl tracking-[-0.025em] text-[var(--text)] select-none">
            <span className="font-normal">The Talk</span>
            <span className="italic font-normal text-xl text-[var(--accent)] px-0.5">of</span>
            <span className="font-normal">Thomas</span>
          </div>
        </Link>
      </header>

      <main className="max-w-xl mx-auto w-full py-20 text-center">
        <span className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 block">
          Lỗi 404
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--text)] mb-6">
          Trang không tồn tại
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed mb-10 max-w-md mx-auto">
          Bài viết hoặc trang bạn đang tìm kiếm có thể đã được lưu trữ, đổi đường dẫn hoặc chưa từng tồn tại.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <span>&larr;</span>
          <span>Trở về trang chủ</span>
        </Link>
      </main>

      <footer className="text-center text-xs text-[var(--muted)] pb-8">
        thetalkofthomas © 2026
      </footer>
    </div>
  );
}
