import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___pages_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_posts_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___posts_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___posts_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___posts_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___posts_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_work_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_work_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_work_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_work_pages_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___work_pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___work_pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___work_pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___work_pages_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_lab_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_lab_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_lab_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_lab_pages_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___lab_pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___lab_pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___lab_pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___lab_pages_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_expertise_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_expertise_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_expertise_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_expertise_pages_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___expertise_pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___expertise_pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___expertise_pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___expertise_pages_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_code_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum_audience_pages_chart_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_audience_pages_chart_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_diagram_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_audience_pages_diagram_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_bespoke_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_audience_pages_bespoke_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_code_v_language" AS ENUM('typescript', 'tsx', 'javascript', 'css', 'json', 'glsl', 'bash');
  CREATE TYPE "public"."enum___audience_pages_v_chart_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___audience_pages_v_chart_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_diagram_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___audience_pages_v_diagram_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_bespoke_v_width" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum___audience_pages_v_bespoke_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_pages_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_pages_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___pages_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___pages_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_posts_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_posts_chart_width" DEFAULT 'wide',
  	"theme" "enum_posts_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_posts_diagram_width" DEFAULT 'wide',
  	"theme" "enum_posts_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_posts_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_posts_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___posts_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___posts_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___posts_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___posts_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___posts_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___posts_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___posts_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_work_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_work_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_work_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_work_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_work_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_work_pages_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_work_pages_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___work_pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___work_pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___work_pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___work_pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___work_pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___work_pages_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___work_pages_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_lab_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_lab_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_lab_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_lab_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_lab_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_lab_pages_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_lab_pages_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___lab_pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___lab_pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___lab_pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___lab_pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___lab_pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___lab_pages_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___lab_pages_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_expertise_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_expertise_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_expertise_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_expertise_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_expertise_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_expertise_pages_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_expertise_pages_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___expertise_pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___expertise_pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___expertise_pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___expertise_pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___expertise_pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___expertise_pages_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___expertise_pages_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_code" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" "enum_audience_pages_code_language" DEFAULT 'typescript',
  	"code" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_audience_pages_chart_width" DEFAULT 'wide',
  	"theme" "enum_audience_pages_chart_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_diagram" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_audience_pages_diagram_width" DEFAULT 'wide',
  	"theme" "enum_audience_pages_diagram_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_bespoke" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum_audience_pages_bespoke_width" DEFAULT 'wide',
  	"theme" "enum_audience_pages_bespoke_theme" DEFAULT 'light',
  	"props" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_code_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" "enum___audience_pages_v_code_v_language" DEFAULT 'typescript',
  	"code" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_chart_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___audience_pages_v_chart_v_width" DEFAULT 'wide',
  	"theme" "enum___audience_pages_v_chart_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"bar","x":{"key":"label","type":"category"},"y":{},"series":[{"key":"value","label":"Value"}],"rows":[{"label":"A","value":12},{"label":"B","value":19}]}'::jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_diagram_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___audience_pages_v_diagram_v_width" DEFAULT 'wide',
  	"theme" "enum___audience_pages_v_diagram_v_theme" DEFAULT 'light',
  	"spec" jsonb DEFAULT '{"specVersion":1,"kind":"flow","direction":"LR","nodes":[{"id":"start","label":"Start","shape":"terminal"},{"id":"finish","label":"Finish","shape":"terminal"}],"edges":[{"from":"start","to":"finish"}]}'::jsonb,
  	"geometry" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_bespoke_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"figure" varchar,
  	"title" varchar,
  	"text_alternative" varchar,
  	"caption" varchar,
  	"data_source_label" varchar,
  	"data_source_href" varchar,
  	"width" "enum___audience_pages_v_bespoke_v_width" DEFAULT 'wide',
  	"theme" "enum___audience_pages_v_bespoke_v_theme" DEFAULT 'light',
  	"props" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_code" ADD CONSTRAINT "pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_chart" ADD CONSTRAINT "pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_diagram" ADD CONSTRAINT "pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_bespoke" ADD CONSTRAINT "pages_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_code_v" ADD CONSTRAINT "__pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_chart_v" ADD CONSTRAINT "__pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_diagram_v" ADD CONSTRAINT "__pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_bespoke_v" ADD CONSTRAINT "__pages_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_code" ADD CONSTRAINT "posts_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_chart" ADD CONSTRAINT "posts_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_diagram" ADD CONSTRAINT "posts_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_bespoke" ADD CONSTRAINT "posts_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_code_v" ADD CONSTRAINT "__posts_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_chart_v" ADD CONSTRAINT "__posts_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_diagram_v" ADD CONSTRAINT "__posts_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_bespoke_v" ADD CONSTRAINT "__posts_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_code" ADD CONSTRAINT "work_pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_chart" ADD CONSTRAINT "work_pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_diagram" ADD CONSTRAINT "work_pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_bespoke" ADD CONSTRAINT "work_pages_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_code_v" ADD CONSTRAINT "__work_pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_chart_v" ADD CONSTRAINT "__work_pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_diagram_v" ADD CONSTRAINT "__work_pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_bespoke_v" ADD CONSTRAINT "__work_pages_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_code" ADD CONSTRAINT "lab_pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_chart" ADD CONSTRAINT "lab_pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_diagram" ADD CONSTRAINT "lab_pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_bespoke" ADD CONSTRAINT "lab_pages_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_code_v" ADD CONSTRAINT "__lab_pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_chart_v" ADD CONSTRAINT "__lab_pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_diagram_v" ADD CONSTRAINT "__lab_pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_bespoke_v" ADD CONSTRAINT "__lab_pages_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_code" ADD CONSTRAINT "expertise_pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_chart" ADD CONSTRAINT "expertise_pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_diagram" ADD CONSTRAINT "expertise_pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_bespoke" ADD CONSTRAINT "expertise_pages_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_code_v" ADD CONSTRAINT "__expertise_pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_chart_v" ADD CONSTRAINT "__expertise_pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_diagram_v" ADD CONSTRAINT "__expertise_pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_bespoke_v" ADD CONSTRAINT "__expertise_pages_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_code" ADD CONSTRAINT "audience_pages_code_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_chart" ADD CONSTRAINT "audience_pages_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_diagram" ADD CONSTRAINT "audience_pages_diagram_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_bespoke" ADD CONSTRAINT "audience_pages_bespoke_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_code_v" ADD CONSTRAINT "__audience_pages_v_code_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_chart_v" ADD CONSTRAINT "__audience_pages_v_chart_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_diagram_v" ADD CONSTRAINT "__audience_pages_v_diagram_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_bespoke_v" ADD CONSTRAINT "__audience_pages_v_bespoke_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_code_order_idx" ON "pages_code" USING btree ("_order");
  CREATE INDEX "pages_code_parent_id_idx" ON "pages_code" USING btree ("_parent_id");
  CREATE INDEX "pages_code_path_idx" ON "pages_code" USING btree ("_path");
  CREATE INDEX "pages_chart_order_idx" ON "pages_chart" USING btree ("_order");
  CREATE INDEX "pages_chart_parent_id_idx" ON "pages_chart" USING btree ("_parent_id");
  CREATE INDEX "pages_chart_path_idx" ON "pages_chart" USING btree ("_path");
  CREATE INDEX "pages_diagram_order_idx" ON "pages_diagram" USING btree ("_order");
  CREATE INDEX "pages_diagram_parent_id_idx" ON "pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "pages_diagram_path_idx" ON "pages_diagram" USING btree ("_path");
  CREATE INDEX "pages_bespoke_order_idx" ON "pages_bespoke" USING btree ("_order");
  CREATE INDEX "pages_bespoke_parent_id_idx" ON "pages_bespoke" USING btree ("_parent_id");
  CREATE INDEX "pages_bespoke_path_idx" ON "pages_bespoke" USING btree ("_path");
  CREATE INDEX "__pages_v_code_v_order_idx" ON "__pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__pages_v_code_v_parent_id_idx" ON "__pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_code_v_path_idx" ON "__pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__pages_v_chart_v_order_idx" ON "__pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__pages_v_chart_v_parent_id_idx" ON "__pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_chart_v_path_idx" ON "__pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__pages_v_diagram_v_order_idx" ON "__pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__pages_v_diagram_v_parent_id_idx" ON "__pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_diagram_v_path_idx" ON "__pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__pages_v_bespoke_v_order_idx" ON "__pages_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__pages_v_bespoke_v_parent_id_idx" ON "__pages_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_bespoke_v_path_idx" ON "__pages_v_bespoke_v" USING btree ("_path");
  CREATE INDEX "posts_code_order_idx" ON "posts_code" USING btree ("_order");
  CREATE INDEX "posts_code_parent_id_idx" ON "posts_code" USING btree ("_parent_id");
  CREATE INDEX "posts_code_path_idx" ON "posts_code" USING btree ("_path");
  CREATE INDEX "posts_chart_order_idx" ON "posts_chart" USING btree ("_order");
  CREATE INDEX "posts_chart_parent_id_idx" ON "posts_chart" USING btree ("_parent_id");
  CREATE INDEX "posts_chart_path_idx" ON "posts_chart" USING btree ("_path");
  CREATE INDEX "posts_diagram_order_idx" ON "posts_diagram" USING btree ("_order");
  CREATE INDEX "posts_diagram_parent_id_idx" ON "posts_diagram" USING btree ("_parent_id");
  CREATE INDEX "posts_diagram_path_idx" ON "posts_diagram" USING btree ("_path");
  CREATE INDEX "posts_bespoke_order_idx" ON "posts_bespoke" USING btree ("_order");
  CREATE INDEX "posts_bespoke_parent_id_idx" ON "posts_bespoke" USING btree ("_parent_id");
  CREATE INDEX "posts_bespoke_path_idx" ON "posts_bespoke" USING btree ("_path");
  CREATE INDEX "__posts_v_code_v_order_idx" ON "__posts_v_code_v" USING btree ("_order");
  CREATE INDEX "__posts_v_code_v_parent_id_idx" ON "__posts_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_code_v_path_idx" ON "__posts_v_code_v" USING btree ("_path");
  CREATE INDEX "__posts_v_chart_v_order_idx" ON "__posts_v_chart_v" USING btree ("_order");
  CREATE INDEX "__posts_v_chart_v_parent_id_idx" ON "__posts_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_chart_v_path_idx" ON "__posts_v_chart_v" USING btree ("_path");
  CREATE INDEX "__posts_v_diagram_v_order_idx" ON "__posts_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__posts_v_diagram_v_parent_id_idx" ON "__posts_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_diagram_v_path_idx" ON "__posts_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__posts_v_bespoke_v_order_idx" ON "__posts_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__posts_v_bespoke_v_parent_id_idx" ON "__posts_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_bespoke_v_path_idx" ON "__posts_v_bespoke_v" USING btree ("_path");
  CREATE INDEX "work_pages_code_order_idx" ON "work_pages_code" USING btree ("_order");
  CREATE INDEX "work_pages_code_parent_id_idx" ON "work_pages_code" USING btree ("_parent_id");
  CREATE INDEX "work_pages_code_path_idx" ON "work_pages_code" USING btree ("_path");
  CREATE INDEX "work_pages_chart_order_idx" ON "work_pages_chart" USING btree ("_order");
  CREATE INDEX "work_pages_chart_parent_id_idx" ON "work_pages_chart" USING btree ("_parent_id");
  CREATE INDEX "work_pages_chart_path_idx" ON "work_pages_chart" USING btree ("_path");
  CREATE INDEX "work_pages_diagram_order_idx" ON "work_pages_diagram" USING btree ("_order");
  CREATE INDEX "work_pages_diagram_parent_id_idx" ON "work_pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "work_pages_diagram_path_idx" ON "work_pages_diagram" USING btree ("_path");
  CREATE INDEX "work_pages_bespoke_order_idx" ON "work_pages_bespoke" USING btree ("_order");
  CREATE INDEX "work_pages_bespoke_parent_id_idx" ON "work_pages_bespoke" USING btree ("_parent_id");
  CREATE INDEX "work_pages_bespoke_path_idx" ON "work_pages_bespoke" USING btree ("_path");
  CREATE INDEX "__work_pages_v_code_v_order_idx" ON "__work_pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_code_v_parent_id_idx" ON "__work_pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_code_v_path_idx" ON "__work_pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_chart_v_order_idx" ON "__work_pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_chart_v_parent_id_idx" ON "__work_pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_chart_v_path_idx" ON "__work_pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_diagram_v_order_idx" ON "__work_pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_diagram_v_parent_id_idx" ON "__work_pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_diagram_v_path_idx" ON "__work_pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_bespoke_v_order_idx" ON "__work_pages_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_bespoke_v_parent_id_idx" ON "__work_pages_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_bespoke_v_path_idx" ON "__work_pages_v_bespoke_v" USING btree ("_path");
  CREATE INDEX "lab_pages_code_order_idx" ON "lab_pages_code" USING btree ("_order");
  CREATE INDEX "lab_pages_code_parent_id_idx" ON "lab_pages_code" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_code_path_idx" ON "lab_pages_code" USING btree ("_path");
  CREATE INDEX "lab_pages_chart_order_idx" ON "lab_pages_chart" USING btree ("_order");
  CREATE INDEX "lab_pages_chart_parent_id_idx" ON "lab_pages_chart" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_chart_path_idx" ON "lab_pages_chart" USING btree ("_path");
  CREATE INDEX "lab_pages_diagram_order_idx" ON "lab_pages_diagram" USING btree ("_order");
  CREATE INDEX "lab_pages_diagram_parent_id_idx" ON "lab_pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_diagram_path_idx" ON "lab_pages_diagram" USING btree ("_path");
  CREATE INDEX "lab_pages_bespoke_order_idx" ON "lab_pages_bespoke" USING btree ("_order");
  CREATE INDEX "lab_pages_bespoke_parent_id_idx" ON "lab_pages_bespoke" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_bespoke_path_idx" ON "lab_pages_bespoke" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_code_v_order_idx" ON "__lab_pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_code_v_parent_id_idx" ON "__lab_pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_code_v_path_idx" ON "__lab_pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_chart_v_order_idx" ON "__lab_pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_chart_v_parent_id_idx" ON "__lab_pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_chart_v_path_idx" ON "__lab_pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_diagram_v_order_idx" ON "__lab_pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_diagram_v_parent_id_idx" ON "__lab_pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_diagram_v_path_idx" ON "__lab_pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_bespoke_v_order_idx" ON "__lab_pages_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_bespoke_v_parent_id_idx" ON "__lab_pages_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_bespoke_v_path_idx" ON "__lab_pages_v_bespoke_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_code_order_idx" ON "expertise_pages_code" USING btree ("_order");
  CREATE INDEX "expertise_pages_code_parent_id_idx" ON "expertise_pages_code" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_code_path_idx" ON "expertise_pages_code" USING btree ("_path");
  CREATE INDEX "expertise_pages_chart_order_idx" ON "expertise_pages_chart" USING btree ("_order");
  CREATE INDEX "expertise_pages_chart_parent_id_idx" ON "expertise_pages_chart" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_chart_path_idx" ON "expertise_pages_chart" USING btree ("_path");
  CREATE INDEX "expertise_pages_diagram_order_idx" ON "expertise_pages_diagram" USING btree ("_order");
  CREATE INDEX "expertise_pages_diagram_parent_id_idx" ON "expertise_pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_diagram_path_idx" ON "expertise_pages_diagram" USING btree ("_path");
  CREATE INDEX "expertise_pages_bespoke_order_idx" ON "expertise_pages_bespoke" USING btree ("_order");
  CREATE INDEX "expertise_pages_bespoke_parent_id_idx" ON "expertise_pages_bespoke" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_bespoke_path_idx" ON "expertise_pages_bespoke" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_code_v_order_idx" ON "__expertise_pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_code_v_parent_id_idx" ON "__expertise_pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_code_v_path_idx" ON "__expertise_pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_chart_v_order_idx" ON "__expertise_pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_chart_v_parent_id_idx" ON "__expertise_pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_chart_v_path_idx" ON "__expertise_pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_diagram_v_order_idx" ON "__expertise_pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_diagram_v_parent_id_idx" ON "__expertise_pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_diagram_v_path_idx" ON "__expertise_pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_bespoke_v_order_idx" ON "__expertise_pages_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_bespoke_v_parent_id_idx" ON "__expertise_pages_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_bespoke_v_path_idx" ON "__expertise_pages_v_bespoke_v" USING btree ("_path");
  CREATE INDEX "audience_pages_code_order_idx" ON "audience_pages_code" USING btree ("_order");
  CREATE INDEX "audience_pages_code_parent_id_idx" ON "audience_pages_code" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_code_path_idx" ON "audience_pages_code" USING btree ("_path");
  CREATE INDEX "audience_pages_chart_order_idx" ON "audience_pages_chart" USING btree ("_order");
  CREATE INDEX "audience_pages_chart_parent_id_idx" ON "audience_pages_chart" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_chart_path_idx" ON "audience_pages_chart" USING btree ("_path");
  CREATE INDEX "audience_pages_diagram_order_idx" ON "audience_pages_diagram" USING btree ("_order");
  CREATE INDEX "audience_pages_diagram_parent_id_idx" ON "audience_pages_diagram" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_diagram_path_idx" ON "audience_pages_diagram" USING btree ("_path");
  CREATE INDEX "audience_pages_bespoke_order_idx" ON "audience_pages_bespoke" USING btree ("_order");
  CREATE INDEX "audience_pages_bespoke_parent_id_idx" ON "audience_pages_bespoke" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_bespoke_path_idx" ON "audience_pages_bespoke" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_code_v_order_idx" ON "__audience_pages_v_code_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_code_v_parent_id_idx" ON "__audience_pages_v_code_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_code_v_path_idx" ON "__audience_pages_v_code_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_chart_v_order_idx" ON "__audience_pages_v_chart_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_chart_v_parent_id_idx" ON "__audience_pages_v_chart_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_chart_v_path_idx" ON "__audience_pages_v_chart_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_diagram_v_order_idx" ON "__audience_pages_v_diagram_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_diagram_v_parent_id_idx" ON "__audience_pages_v_diagram_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_diagram_v_path_idx" ON "__audience_pages_v_diagram_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_bespoke_v_order_idx" ON "__audience_pages_v_bespoke_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_bespoke_v_parent_id_idx" ON "__audience_pages_v_bespoke_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_bespoke_v_path_idx" ON "__audience_pages_v_bespoke_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_code" CASCADE;
  DROP TABLE "pages_chart" CASCADE;
  DROP TABLE "pages_diagram" CASCADE;
  DROP TABLE "pages_bespoke" CASCADE;
  DROP TABLE "__pages_v_code_v" CASCADE;
  DROP TABLE "__pages_v_chart_v" CASCADE;
  DROP TABLE "__pages_v_diagram_v" CASCADE;
  DROP TABLE "__pages_v_bespoke_v" CASCADE;
  DROP TABLE "posts_code" CASCADE;
  DROP TABLE "posts_chart" CASCADE;
  DROP TABLE "posts_diagram" CASCADE;
  DROP TABLE "posts_bespoke" CASCADE;
  DROP TABLE "__posts_v_code_v" CASCADE;
  DROP TABLE "__posts_v_chart_v" CASCADE;
  DROP TABLE "__posts_v_diagram_v" CASCADE;
  DROP TABLE "__posts_v_bespoke_v" CASCADE;
  DROP TABLE "work_pages_code" CASCADE;
  DROP TABLE "work_pages_chart" CASCADE;
  DROP TABLE "work_pages_diagram" CASCADE;
  DROP TABLE "work_pages_bespoke" CASCADE;
  DROP TABLE "__work_pages_v_code_v" CASCADE;
  DROP TABLE "__work_pages_v_chart_v" CASCADE;
  DROP TABLE "__work_pages_v_diagram_v" CASCADE;
  DROP TABLE "__work_pages_v_bespoke_v" CASCADE;
  DROP TABLE "lab_pages_code" CASCADE;
  DROP TABLE "lab_pages_chart" CASCADE;
  DROP TABLE "lab_pages_diagram" CASCADE;
  DROP TABLE "lab_pages_bespoke" CASCADE;
  DROP TABLE "__lab_pages_v_code_v" CASCADE;
  DROP TABLE "__lab_pages_v_chart_v" CASCADE;
  DROP TABLE "__lab_pages_v_diagram_v" CASCADE;
  DROP TABLE "__lab_pages_v_bespoke_v" CASCADE;
  DROP TABLE "expertise_pages_code" CASCADE;
  DROP TABLE "expertise_pages_chart" CASCADE;
  DROP TABLE "expertise_pages_diagram" CASCADE;
  DROP TABLE "expertise_pages_bespoke" CASCADE;
  DROP TABLE "__expertise_pages_v_code_v" CASCADE;
  DROP TABLE "__expertise_pages_v_chart_v" CASCADE;
  DROP TABLE "__expertise_pages_v_diagram_v" CASCADE;
  DROP TABLE "__expertise_pages_v_bespoke_v" CASCADE;
  DROP TABLE "audience_pages_code" CASCADE;
  DROP TABLE "audience_pages_chart" CASCADE;
  DROP TABLE "audience_pages_diagram" CASCADE;
  DROP TABLE "audience_pages_bespoke" CASCADE;
  DROP TABLE "__audience_pages_v_code_v" CASCADE;
  DROP TABLE "__audience_pages_v_chart_v" CASCADE;
  DROP TABLE "__audience_pages_v_diagram_v" CASCADE;
  DROP TABLE "__audience_pages_v_bespoke_v" CASCADE;
  DROP TYPE "public"."enum_pages_code_language";
  DROP TYPE "public"."enum_pages_chart_width";
  DROP TYPE "public"."enum_pages_chart_theme";
  DROP TYPE "public"."enum_pages_diagram_width";
  DROP TYPE "public"."enum_pages_diagram_theme";
  DROP TYPE "public"."enum_pages_bespoke_width";
  DROP TYPE "public"."enum_pages_bespoke_theme";
  DROP TYPE "public"."enum___pages_v_code_v_language";
  DROP TYPE "public"."enum___pages_v_chart_v_width";
  DROP TYPE "public"."enum___pages_v_chart_v_theme";
  DROP TYPE "public"."enum___pages_v_diagram_v_width";
  DROP TYPE "public"."enum___pages_v_diagram_v_theme";
  DROP TYPE "public"."enum___pages_v_bespoke_v_width";
  DROP TYPE "public"."enum___pages_v_bespoke_v_theme";
  DROP TYPE "public"."enum_posts_code_language";
  DROP TYPE "public"."enum_posts_chart_width";
  DROP TYPE "public"."enum_posts_chart_theme";
  DROP TYPE "public"."enum_posts_diagram_width";
  DROP TYPE "public"."enum_posts_diagram_theme";
  DROP TYPE "public"."enum_posts_bespoke_width";
  DROP TYPE "public"."enum_posts_bespoke_theme";
  DROP TYPE "public"."enum___posts_v_code_v_language";
  DROP TYPE "public"."enum___posts_v_chart_v_width";
  DROP TYPE "public"."enum___posts_v_chart_v_theme";
  DROP TYPE "public"."enum___posts_v_diagram_v_width";
  DROP TYPE "public"."enum___posts_v_diagram_v_theme";
  DROP TYPE "public"."enum___posts_v_bespoke_v_width";
  DROP TYPE "public"."enum___posts_v_bespoke_v_theme";
  DROP TYPE "public"."enum_work_pages_code_language";
  DROP TYPE "public"."enum_work_pages_chart_width";
  DROP TYPE "public"."enum_work_pages_chart_theme";
  DROP TYPE "public"."enum_work_pages_diagram_width";
  DROP TYPE "public"."enum_work_pages_diagram_theme";
  DROP TYPE "public"."enum_work_pages_bespoke_width";
  DROP TYPE "public"."enum_work_pages_bespoke_theme";
  DROP TYPE "public"."enum___work_pages_v_code_v_language";
  DROP TYPE "public"."enum___work_pages_v_chart_v_width";
  DROP TYPE "public"."enum___work_pages_v_chart_v_theme";
  DROP TYPE "public"."enum___work_pages_v_diagram_v_width";
  DROP TYPE "public"."enum___work_pages_v_diagram_v_theme";
  DROP TYPE "public"."enum___work_pages_v_bespoke_v_width";
  DROP TYPE "public"."enum___work_pages_v_bespoke_v_theme";
  DROP TYPE "public"."enum_lab_pages_code_language";
  DROP TYPE "public"."enum_lab_pages_chart_width";
  DROP TYPE "public"."enum_lab_pages_chart_theme";
  DROP TYPE "public"."enum_lab_pages_diagram_width";
  DROP TYPE "public"."enum_lab_pages_diagram_theme";
  DROP TYPE "public"."enum_lab_pages_bespoke_width";
  DROP TYPE "public"."enum_lab_pages_bespoke_theme";
  DROP TYPE "public"."enum___lab_pages_v_code_v_language";
  DROP TYPE "public"."enum___lab_pages_v_chart_v_width";
  DROP TYPE "public"."enum___lab_pages_v_chart_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_diagram_v_width";
  DROP TYPE "public"."enum___lab_pages_v_diagram_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_bespoke_v_width";
  DROP TYPE "public"."enum___lab_pages_v_bespoke_v_theme";
  DROP TYPE "public"."enum_expertise_pages_code_language";
  DROP TYPE "public"."enum_expertise_pages_chart_width";
  DROP TYPE "public"."enum_expertise_pages_chart_theme";
  DROP TYPE "public"."enum_expertise_pages_diagram_width";
  DROP TYPE "public"."enum_expertise_pages_diagram_theme";
  DROP TYPE "public"."enum_expertise_pages_bespoke_width";
  DROP TYPE "public"."enum_expertise_pages_bespoke_theme";
  DROP TYPE "public"."enum___expertise_pages_v_code_v_language";
  DROP TYPE "public"."enum___expertise_pages_v_chart_v_width";
  DROP TYPE "public"."enum___expertise_pages_v_chart_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_diagram_v_width";
  DROP TYPE "public"."enum___expertise_pages_v_diagram_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_bespoke_v_width";
  DROP TYPE "public"."enum___expertise_pages_v_bespoke_v_theme";
  DROP TYPE "public"."enum_audience_pages_code_language";
  DROP TYPE "public"."enum_audience_pages_chart_width";
  DROP TYPE "public"."enum_audience_pages_chart_theme";
  DROP TYPE "public"."enum_audience_pages_diagram_width";
  DROP TYPE "public"."enum_audience_pages_diagram_theme";
  DROP TYPE "public"."enum_audience_pages_bespoke_width";
  DROP TYPE "public"."enum_audience_pages_bespoke_theme";
  DROP TYPE "public"."enum___audience_pages_v_code_v_language";
  DROP TYPE "public"."enum___audience_pages_v_chart_v_width";
  DROP TYPE "public"."enum___audience_pages_v_chart_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_diagram_v_width";
  DROP TYPE "public"."enum___audience_pages_v_diagram_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_bespoke_v_width";
  DROP TYPE "public"."enum___audience_pages_v_bespoke_v_theme";`)
}
