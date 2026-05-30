-- Thêm phân mục blog (Tips hay, Giày Sneaker, …)
alter table public.blog_posts
  add column if not exists category text;
