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
}
