"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Email hoặc mật khẩu không chính xác.");
      } else {
        localStorage.setItem(
          "thomas_admin_session",
          JSON.stringify({
            email: data.email || email.trim(),
            loggedInAt: new Date().toISOString(),
          })
        );
        router.push("/admin");
      }
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-10">
      <header className="max-w-md mx-auto w-full pt-8">
        <Link
          href="/"
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors inline-flex items-center gap-1.5"
        >
          <span>&larr;</span>
          <span>Trang chủ thetalkofthomas</span>
        </Link>
      </header>

      <div className="max-w-md mx-auto w-full py-12">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[2px] border border-[var(--border)] flex items-center justify-center">
            <span className="font-serif text-base font-bold text-[var(--accent)]">T</span>
          </div>
          <div className="flex items-baseline gap-1 font-serif text-2xl tracking-tight text-[var(--text)]">
            <span>The Talk</span>
            <span className="italic font-light text-lg text-[var(--accent)]">of</span>
            <span>Thomas</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-normal text-[var(--text)] mb-2">
          Đăng nhập quản trị
        </h1>
        <p className="text-sm text-[var(--muted)] mb-8">
          Khu vực dành riêng cho tác giả để quản lý và xuất bản bài viết.
        </p>

        {errorMsg && (
          <div className="p-3 mb-6 rounded text-xs bg-red-500/10 border border-red-500/20 text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded border border-subtle bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded border border-subtle bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-[var(--text)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      </div>

      <footer className="text-center text-xs text-[var(--muted)] pb-6">
        thetalkofthomas © 2026
      </footer>
    </div>
  );
}
