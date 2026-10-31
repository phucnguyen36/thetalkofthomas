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
    published BOOLEAN DEFAULT false,
    cover_image TEXT
);

-- Bổ sung cột cover_image nếu bảng posts đã tồn tại từ trước
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. XÓA VĨNH VIỄN 4 BÀI VIẾT MẪU CŨ KHÔNG LIÊN QUAN
DELETE FROM public.posts 
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
) OR slug IN (
  've-su-im-lang-trong-nhung-cuoc-dam-phan-quan-trong',
  'nguyen-tac-ra-quyet-dinh-khi-khong-co-du-du-lieu',
  'ky-luat-tu-than-trong-moi-truong-qua-tai-thong-tin',
  'ghi-chep-ve-cach-xay-dung-vi-the-doc-lap'
);

-- 3. TẮT BẢO MẬT RLS ĐỂ CHO PHÉP THÊM, SỬA, XÓA TỪ GIAO DIỆN WEB
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- Tạo chính sách dự phòng (nếu Supabase vô tình bật lại RLS thì vẫn không bị chặn)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for posts" ON public.posts;
    CREATE POLICY "Allow all for posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
END $$;


-- 4. BẢNG BÌNH LUẬN (COMMENTS)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tạo Index để tăng tốc truy vấn bình luận theo bài viết
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- Tắt bảo mật RLS cho comments
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all for comments" ON public.comments;
    CREATE POLICY "Allow all for comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
END $$;


-- 5. STORAGE BUCKET CHO ẢNH BÀI VIẾT (TÙY CHỌN - BLOG-IMAGES)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access for blog-images'
    ) THEN
        CREATE POLICY "Public Access for blog-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'blog-images');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Upload to blog-images'
    ) THEN
        CREATE POLICY "Allow Upload to blog-images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'blog-images');
    END IF;
END $$;
