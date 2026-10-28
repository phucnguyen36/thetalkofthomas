"use client";

import { useState, useRef } from "react";
import { compressImage } from "@/lib/image-compress";

interface CoverImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
}

export function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      // Tự động nén ảnh trên máy người dùng trước khi gửi (giảm từ 5MB -> ~100KB)
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Lỗi khi tải ảnh lên.");
      } else {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        }
      }
    } catch {
      setErrorMsg("Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">
        Ảnh bìa bài viết (Cover Image)
      </label>

      {errorMsg && (
        <div className="mb-2 p-2 rounded text-xs bg-red-500/10 border border-red-500/20 text-red-500">
          {errorMsg}
        </div>
      )}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-subtle bg-[var(--card-bg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh bìa bài viết"
            className="w-full h-48 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer"
            >
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Dán đường dẫn ảnh (URL) hoặc tải từ máy tính..."
            className="flex-1 px-3.5 py-2 rounded border border-subtle bg-transparent text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded border border-subtle bg-[var(--card-bg)] text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {uploading ? (
              <>
                <span className="w-3 h-3 border-2 border-[var(--text)] border-t-transparent rounded-full animate-spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <span>📁 Tải ảnh từ máy</span>
              </>
            )}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

interface ContentImageToolbarProps {
  onInsertImage: (markdownSnippet: string) => void;
}

export function ContentImageToolbar({ onInsertImage }: ContentImageToolbarProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [altInput, setAltInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          const altText = file.name.replace(/\.[^.]+$/, "");
          onInsertImage(`\n\n![${altText}](${data.url})\n\n`);
        }
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsertUrl = () => {
    if (!urlInput.trim()) return;
    const alt = altInput.trim() || "Hình ảnh";
    onInsertImage(`\n\n![${alt}](${urlInput.trim()})\n\n`);
    setUrlInput("");
    setAltInput("");
    setShowUrlModal(false);
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="px-2.5 py-1 rounded border border-subtle bg-[var(--card-bg)] text-[11px] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1.5"
      >
        {uploading ? (
          <>
            <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Đang tải ảnh...</span>
          </>
        ) : (
          <>
            <span>📷 Chèn ảnh từ máy</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setShowUrlModal(!showUrlModal)}
        className="px-2.5 py-1 rounded border border-subtle bg-[var(--card-bg)] text-[11px] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1"
      >
        <span>🔗 Chèn ảnh từ link URL</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {showUrlModal && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded border border-subtle bg-[var(--card-bg)] text-xs">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="URL ảnh (https://...)"
            className="px-2 py-1 rounded border border-subtle bg-transparent text-xs text-[var(--text)] w-48 focus:outline-none focus:border-[var(--accent)]"
          />
          <input
            type="text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder="Chú thích ảnh"
            className="px-2 py-1 rounded border border-subtle bg-transparent text-xs text-[var(--text)] w-32 focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleInsertUrl}
            className="px-2.5 py-1 rounded bg-[var(--text)] text-[var(--bg)] text-xs font-medium hover:opacity-90"
          >
            Chèn
          </button>
          <button
            type="button"
            onClick={() => setShowUrlModal(false)}
            className="text-[var(--muted)] hover:text-[var(--text)] text-xs"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
