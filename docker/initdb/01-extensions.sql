-- Runs once, only when the Postgres volume is first initialized (fresh
-- `docker compose up` on an empty `postgres_data` volume). Keeps a clean local
-- reset self-contained: the Ask RAG `ask_embeddings` table has a vector column,
-- and local dev builds schema via Drizzle push — which never runs the
-- `ask_embeddings` migration that creates this extension on prod. Without this,
-- the first `pnpm dev` after `docker compose down -v` fails on the vector type.
CREATE EXTENSION IF NOT EXISTS vector;
