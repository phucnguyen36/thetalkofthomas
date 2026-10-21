-- ================================================================
-- THETALKOFTHOMAS — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ================================================================

-- 1. BẢNG BÀI VIẾT (POSTS)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Chiến lược',
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    read_time TEXT DEFAULT '5 phút đọc',
    published BOOLEAN DEFAULT false
);

-- 2. KÍCH HOẠT BẢO MẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. XÓA POLICY CŨ NẾU ĐÃ TỒN TẠI (TRÁNH LỖI DUPLICATE POLICY)
DROP POLICY IF EXISTS "Public readers can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can do everything when authenticated" ON public.posts;

-- Độc giả công khai: Chỉ được đọc bài viết ĐÃ XUẤT BẢN (published = true)
CREATE POLICY "Public readers can view published posts" 
ON public.posts 
FOR SELECT 
USING (published = true);

-- Quản trị viên (Thomas - đã đăng nhập): Toàn quyền Xem, Thêm, Sửa, Xóa mọi bài viết
CREATE POLICY "Admin can do everything when authenticated" 
ON public.posts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. DỌN DẸP DỮ LIỆU CŨ BỊ TRÙNG LẶP (NẾU BẠN TỪNG CHẠY SCRIPT NHIỀU LẦN)
-- Script này sẽ xóa các bản ghi cũ có cùng slug để chỉ giữ lại bản ghi chuẩn duy nhất
DELETE FROM public.posts 
WHERE slug IN (
  've-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong',
  'nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu',
  'ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin',
  'ghi-chep-ve-cach-xay-dung-vi-the-doc-lap'
);

-- 5. CHÈN DỮ LIỆU CHUẨN VỚI UUID CỐ ĐỊNH (TRÙNG KHỚP 100% VỚI CODE LOCAL)
INSERT INTO public.posts (id, title, slug, category, excerpt, content, read_time, published)
VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Về sự im lặng trong những cuộc đàm phán quan trọng',
  've-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong',
  'Chiến lược',
  'Trong phần lớn các cuộc trò chuyện căng thẳng, người lên tiếng đầu tiên thường là người bộc lộ nhiều điểm yếu nhất. Sự im lặng không đồng nghĩa với bối rối hay nhượng bộ — nó là khoảng dừng cần thiết để quan sát toàn bộ bàn cờ.',
  'Trong công việc và kinh doanh, chúng ta rất dễ bị cuốn vào ảo tưởng rằng kẻ nói nhiều nhất, to tiếng nhất là kẻ nắm quyền kiểm soát. Nhưng thực tế thường chứng minh điều ngược lại.\n\nKhi bạn chủ động giữ sự tĩnh lặng, bạn buộc đối phương phải lấp đầy khoảng trống đó bằng lời nói của chính họ. Đó là lúc những sơ hở, sự bất an và mục đích thật sự bắt đầu lộ diện.\n\nKỷ luật không phải là sự gò bó ép buộc, mà là sự tự do tối cao: tự do khỏi những phản ứng bộc phát thiếu suy nghĩ, và khả năng chỉ hành động khi thời điểm thực sự chín muồi.',
  '5 phút đọc',
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Nguyên tắc ra quyết định khi không có đủ dữ liệu',
  'nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu',
  'Tư duy',
  'Chờ đợi cho đến khi có 100% dữ liệu đồng nghĩa với việc bạn đã bỏ lỡ thời cơ. Những quyết định bước ngoặt trong sự nghiệp luôn đòi hỏi bạn phải chấp nhận rủi ro có tính toán.',
  'Sự tê liệt do phân tích quá mức là cái bẫy lớn nhất của trí thức. Cách xây dựng trực giác có căn cứ và chấp nhận rủi ro có tính toán khi thời khắc đến.\n\nNgười lãnh đạo giỏi không phải là người không bao giờ phạm sai lầm, mà là người biết cách đưa ra quyết định dứt khoát trong điều kiện mập mờ và chịu trách nhiệm đến cùng.',
  '4 phút đọc',
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Kỷ luật tự thân trong môi trường quá tải thông tin',
  'ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin',
  'Tư duy',
  'Mỗi ngày có hàng trăm thông báo cố gắng giành lấy sự chú ý của bạn. Khả năng nói không với những kích thích tầm thường là điều kiện tiên quyết để tạo ra kết quả có giá trị.',
  'Não bộ con người không được tạo ra để tiếp nhận hàng ngàn kích thích rẻ tiền mỗi ngày. Khả năng nói không là thứ vũ khí quyền năng nhất.\n\nHãy dựng lên một pháo đài tinh thần để bảo vệ năng lượng cho những mục tiêu thật sự dài hạn.',
  '6 phút đọc',
  true
),
(
  '00000000-0000-0000-0000-000000000004',
  'Ghi chép về cách xây dựng vị thế độc lập',
  'ghi-chep-ve-cach-xay-dung-vi-the-doc-lap',
  'Ghi chép',
  'Sự độc lập không đến từ việc đối đầu với mọi người, mà đến từ việc xây dựng năng lực chuyên môn hiếm hoi và tự chủ về tư duy lẫn tài chính.',
  'Độc lập không có nghĩa là đối đầu với tất cả. Độc lập là làm chủ được thời gian, kỹ năng cốt lõi và không bị phụ thuộc vào sự chấp thuận của người khác.',
  '7 phút đọc',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET 
  id = EXCLUDED.id,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  read_time = EXCLUDED.read_time,
  published = EXCLUDED.published;
