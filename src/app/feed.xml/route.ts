import { NextResponse } from "next/server";

const POSTS = [
  {
    title: "Về sự im lặng trong những cuộc đàm phán quan trọng",
    slug: "ve-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong",
    pubDate: "Wed, 21 Oct 2026 00:00:00 GMT",
    excerpt: "Trong phần lớn các cuộc trò chuyện căng thẳng, người lên tiếng đầu tiên thường là người bộc lộ nhiều điểm yếu nhất. Sự im lặng không đồng nghĩa với bối rối hay nhượng bộ — nó là khoảng dừng cần thiết để quan sát toàn bộ bàn cờ.",
  },
  {
    title: "Nguyên tắc ra quyết định khi không có đủ dữ liệu",
    slug: "nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu",
    pubDate: "Thu, 15 Oct 2026 00:00:00 GMT",
    excerpt: "Chờ đợi cho đến khi có 100% dữ liệu đồng nghĩa với việc bạn đã bỏ lỡ thời cơ. Những quyết định bước ngoặt trong sự nghiệp luôn đòi hỏi bạn phải chấp nhận rủi ro có tính toán.",
  },
  {
    title: "Kỷ luật tự thân trong môi trường quá tải thông tin",
    slug: "ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin",
    pubDate: "Thu, 08 Oct 2026 00:00:00 GMT",
    excerpt: "Mỗi ngày có hàng trăm thông báo cố gắng giành lấy sự chú ý của bạn. Khả năng nói không với những kích thích tầm thường là điều kiện tiên quyết để tạo ra kết quả có giá trị.",
  },
  {
    title: "Ghi chép về cách xây dựng vị thế độc lập",
    slug: "ghi-chep-ve-cach-xay-dung-vi-the-doc-lap",
    pubDate: "Tue, 29 Sep 2026 00:00:00 GMT",
    excerpt: "Sự độc lập không đến từ việc đối đầu với mọi người, mà đến từ việc xây dựng năng lực chuyên môn hiếm hoi và tự chủ về tư duy lẫn tài chính.",
  },
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thetalkofthomas.com";

  const feedItems = POSTS.map(
    (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/#${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/#${post.slug}</guid>
      <pubDate>${post.pubDate}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`
  ).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Talk of Thomas</title>
    <link>${baseUrl}</link>
    <description>Một tạp văn biên tập về chiến lược, tư duy và kỷ luật tự thân trong kỷ nguyên số.</description>
    <language>vi</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
