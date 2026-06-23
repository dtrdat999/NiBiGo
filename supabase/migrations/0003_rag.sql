-- ─────────────────────────────────────────────────────────────
-- NiBiGo AI Planner — 0003_rag
-- Schema RAG (pgvector). Dùng từ Phase 6 (AI tư vấn bám chính sách/FAQ).
-- An toàn để chạy ngay; chưa bắt buộc dùng tới khi chưa tới Phase 6.
-- ─────────────────────────────────────────────────────────────

create extension if not exists vector;

create table if not exists public.knowledge_documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  source_type text not null,            -- 'policy' | 'faq' | 'destination_guide' | 'product_note'
  ref_id      uuid,                     -- optional: trỏ travel_products.id / destinations.id
  content     text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  chunk_index smallint not null,
  content     text not null,
  embedding   vector(1536),             -- chỉnh theo model embedding (OpenAI text-embedding-3-small = 1536)
  created_at  timestamptz not null default now()
);

create index if not exists idx_chunks_doc on public.knowledge_chunks (document_id);

-- ivfflat cho cosine similarity. Chạy lại (reindex) sau khi đã có dữ liệu để tối ưu.
create index if not exists idx_chunks_embedding on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RLS: đọc công khai khi active; ghi qua admin/service role.
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks   enable row level security;

drop policy if exists kdocs_read on public.knowledge_documents;
create policy kdocs_read on public.knowledge_documents
  for select using (is_active or public.is_admin());

drop policy if exists kdocs_admin_write on public.knowledge_documents;
create policy kdocs_admin_write on public.knowledge_documents
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists kchunks_read on public.knowledge_chunks;
create policy kchunks_read on public.knowledge_chunks
  for select using (
    exists (
      select 1 from public.knowledge_documents d
      where d.id = document_id and (d.is_active or public.is_admin())
    )
  );

-- match function cho vector search (dùng ở Phase 6 qua service role)
create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, document_id uuid, content text, similarity float)
language sql stable as $$
  select c.id, c.document_id, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks c
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
