"use client";

import React from "react";

interface ArticleBodyProps {
  content: string;
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  if (!content) return null;

  // Tách nội dung thành từng khối (paragraphs / blocks)
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="space-y-6 text-base sm:text-lg leading-[1.85] text-[var(--reader-text)] font-normal">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Kiểm tra ảnh cú pháp Markdown: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const src = imgMatch[2];
          return (
            <figure key={index} className="my-8">
              <div className="overflow-hidden rounded-lg border border-[var(--reader-border)] bg-[var(--bg)] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || "Hình ảnh bài viết"}
                  className="w-full object-cover max-h-[580px] hover:scale-[1.01] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-xs text-[var(--muted)] mt-2.5 font-serif italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // 2. Tiêu đề cấp 2: ## Tiêu đề
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="font-serif text-2xl sm:text-3xl font-normal text-[var(--reader-title)] mt-10 mb-4 leading-snug"
            >
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }

        // 3. Tiêu đề cấp 3: ### Tiêu đề
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="font-serif text-xl sm:text-2xl font-normal text-[var(--reader-title)] mt-8 mb-3 leading-snug"
            >
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }

        // 4. Trích dẫn khối: > Trích dẫn
        if (trimmed.startsWith("> ")) {
          const quoteText = trimmed.replace(/^>\s*/gm, "");
          return (
            <blockquote
              key={index}
              className="border-l-2 border-[var(--accent)] pl-6 my-6 italic text-[var(--accent)] font-serif text-lg sm:text-xl leading-relaxed"
            >
              {quoteText}
            </blockquote>
          );
        }

        // 5. Danh sách gạch đầu dòng: - mục 1
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n/).map((line) => line.replace(/^[-*]\s+/, ""));
          return (
            <ul key={index} className="list-disc pl-6 space-y-2 my-4">
              {items.map((it, i) => (
                <li key={i}>{renderFormattedText(it)}</li>
              ))}
            </ul>
          );
        }

        // 6. Đoạn văn bản thông thường (hỗ trợ in đậm, in nghiêng, ngắt dòng)
        return (
          <p key={index} className="whitespace-pre-line leading-relaxed">
            {renderFormattedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Xử lý in đậm **bold** và in nghiêng *italic*
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--reader-title)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
