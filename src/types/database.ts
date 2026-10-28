export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  read_time: string;
  published: boolean;
  cover_image?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
}
