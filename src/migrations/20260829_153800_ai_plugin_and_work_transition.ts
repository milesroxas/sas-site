import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_wp_transition_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_wp_transition_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__wp_transition_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__wp_transition_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_plugin_ai_instructions_field_type" AS ENUM('text', 'textarea', 'upload', 'richText');
  CREATE TYPE "public"."enum_plugin_ai_instructions_model_id" AS ENUM('Oai-text', 'dall-e', 'gpt-image-1', 'tts', 'Oai-object');
  CREATE TYPE "public"."enum_plugin_ai_instructions_oai_text_settings_model" AS ENUM('gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1', 'gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-3.5-turbo');
  CREATE TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_version" AS ENUM('dall-e-3', 'dall-e-2');
  CREATE TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_size" AS ENUM('256x256', '512x512', '1024x1024', '1792x1024', '1024x1792');
  CREATE TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_style" AS ENUM('vivid', 'natural');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_version" AS ENUM('gpt-image-1');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_size" AS ENUM('1024x1024', '1024x1536', '1536x1024', 'auto');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_quality" AS ENUM('low', 'medium', 'high', 'auto');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_output_format" AS ENUM('png', 'jpeg', 'webp');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_background" AS ENUM('white', 'transparent');
  CREATE TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_moderation" AS ENUM('auto', 'low');
  CREATE TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_voice" AS ENUM('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer');
  CREATE TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_model" AS ENUM('tts-1', 'tts-1-hd');
  CREATE TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_response_format" AS ENUM('mp3', 'opus', 'aac', 'flac', 'wav', 'pcm');
  CREATE TYPE "public"."enum_plugin_ai_instructions_oai_object_settings_model" AS ENUM('gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1', 'gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-3.5-turbo');
  CREATE TABLE "plugin_ai_instructions_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "plugin_ai_instructions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"schema_path" varchar,
  	"field_type" "enum_plugin_ai_instructions_field_type" DEFAULT 'text',
  	"relation_to" varchar,
  	"model_id" "enum_plugin_ai_instructions_model_id",
  	"disabled" boolean DEFAULT false,
  	"prompt" varchar,
  	"system" varchar DEFAULT 'INSTRUCTIONS:
  You are a highly skilled and professional blog writer,
  renowned for crafting engaging and well-organized articles.
  When given a title, you meticulously create blogs that are not only
  informative and accurate but also captivating and beautifully structured.',
  	"layout" varchar DEFAULT '[paragraph] - Write a concise introduction (2-3 sentences) that outlines the main topic.
  [horizontalrule] - Insert a horizontal rule to separate the introduction from the main content.
  [list] - Create a list with 3-5 items. Each list item should contain:
     a. [heading] - A brief, descriptive heading (up to 5 words)
     b. [paragraph] - A short explanation or elaboration (1-2 sentences)
  [horizontalrule] - Insert another horizontal rule to separate the main content from the conclusion.
  [paragraph] - Compose a brief conclusion (2-3 sentences) summarizing the key points.
  [quote] - Include a relevant quote from a famous person, directly related to the topic. Format: "Quote text." - Author Name',
  	"oai_text_settings_model" "enum_plugin_ai_instructions_oai_text_settings_model" DEFAULT 'gpt-4o-mini',
  	"oai_text_settings_max_tokens" numeric DEFAULT 5000,
  	"oai_text_settings_temperature" numeric DEFAULT 0.7,
  	"oai_text_settings_extract_attachments" boolean,
  	"dalle_e_settings_version" "enum_plugin_ai_instructions_dalle_e_settings_version" DEFAULT 'dall-e-3',
  	"dalle_e_settings_size" "enum_plugin_ai_instructions_dalle_e_settings_size" DEFAULT '1024x1024',
  	"dalle_e_settings_style" "enum_plugin_ai_instructions_dalle_e_settings_style" DEFAULT 'natural',
  	"dalle_e_settings_enable_prompt_optimization" boolean,
  	"gpt_image_1_settings_version" "enum_plugin_ai_instructions_gpt_image_1_settings_version" DEFAULT 'gpt-image-1',
  	"gpt_image_1_settings_size" "enum_plugin_ai_instructions_gpt_image_1_settings_size" DEFAULT 'auto',
  	"gpt_image_1_settings_quality" "enum_plugin_ai_instructions_gpt_image_1_settings_quality" DEFAULT 'auto',
  	"gpt_image_1_settings_output_format" "enum_plugin_ai_instructions_gpt_image_1_settings_output_format" DEFAULT 'png',
  	"gpt_image_1_settings_output_compression" numeric DEFAULT 100,
  	"gpt_image_1_settings_background" "enum_plugin_ai_instructions_gpt_image_1_settings_background" DEFAULT 'white',
  	"gpt_image_1_settings_moderation" "enum_plugin_ai_instructions_gpt_image_1_settings_moderation" DEFAULT 'auto',
  	"oai_tts_settings_voice" "enum_plugin_ai_instructions_oai_tts_settings_voice" DEFAULT 'alloy',
  	"oai_tts_settings_model" "enum_plugin_ai_instructions_oai_tts_settings_model" DEFAULT 'tts-1',
  	"oai_tts_settings_response_format" "enum_plugin_ai_instructions_oai_tts_settings_response_format" DEFAULT 'mp3',
  	"oai_tts_settings_speed" numeric DEFAULT 1,
  	"oai_object_settings_model" "enum_plugin_ai_instructions_oai_object_settings_model" DEFAULT 'gpt-4o',
  	"oai_object_settings_max_tokens" numeric DEFAULT 5000,
  	"oai_object_settings_temperature" numeric DEFAULT 0.7,
  	"oai_object_settings_extract_attachments" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "wp_transition" ADD COLUMN "source" "enum_wp_transition_source" DEFAULT 'custom';
  ALTER TABLE "wp_transition" ADD COLUMN "story_scope" "enum_wp_transition_story_scope" DEFAULT 'overview';
  ALTER TABLE "wp_transition" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "wp_transition" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_wp_transition_v" ADD COLUMN "source" "enum__wp_transition_v_source" DEFAULT 'custom';
  ALTER TABLE "_wp_transition_v" ADD COLUMN "story_scope" "enum__wp_transition_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "_wp_transition_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_wp_transition_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "plugin_ai_instructions_id" integer;
  ALTER TABLE "plugin_ai_instructions_images" ADD CONSTRAINT "plugin_ai_instructions_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "plugin_ai_instructions_images" ADD CONSTRAINT "plugin_ai_instructions_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plugin_ai_instructions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "plugin_ai_instructions_images_order_idx" ON "plugin_ai_instructions_images" USING btree ("_order");
  CREATE INDEX "plugin_ai_instructions_images_parent_id_idx" ON "plugin_ai_instructions_images" USING btree ("_parent_id");
  CREATE INDEX "plugin_ai_instructions_images_image_idx" ON "plugin_ai_instructions_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "plugin_ai_instructions_schema_path_idx" ON "plugin_ai_instructions" USING btree ("schema_path");
  CREATE INDEX "plugin_ai_instructions_updated_at_idx" ON "plugin_ai_instructions" USING btree ("updated_at");
  CREATE INDEX "plugin_ai_instructions_created_at_idx" ON "plugin_ai_instructions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plugin_ai_instructions_fk" FOREIGN KEY ("plugin_ai_instructions_id") REFERENCES "public"."plugin_ai_instructions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_plugin_ai_instructions_id_idx" ON "payload_locked_documents_rels" USING btree ("plugin_ai_instructions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "plugin_ai_instructions_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "plugin_ai_instructions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "plugin_ai_instructions_images" CASCADE;
  DROP TABLE "plugin_ai_instructions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_plugin_ai_instructions_fk";
  
  DROP INDEX "payload_locked_documents_rels_plugin_ai_instructions_id_idx";
  ALTER TABLE "wp_transition" DROP COLUMN "source";
  ALTER TABLE "wp_transition" DROP COLUMN "story_scope";
  ALTER TABLE "wp_transition" DROP COLUMN "story_beat_key";
  ALTER TABLE "wp_transition" DROP COLUMN "show_overrides";
  ALTER TABLE "_wp_transition_v" DROP COLUMN "source";
  ALTER TABLE "_wp_transition_v" DROP COLUMN "story_scope";
  ALTER TABLE "_wp_transition_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "_wp_transition_v" DROP COLUMN "show_overrides";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "plugin_ai_instructions_id";
  DROP TYPE "public"."enum_wp_transition_source";
  DROP TYPE "public"."enum_wp_transition_story_scope";
  DROP TYPE "public"."enum__wp_transition_v_source";
  DROP TYPE "public"."enum__wp_transition_v_story_scope";
  DROP TYPE "public"."enum_plugin_ai_instructions_field_type";
  DROP TYPE "public"."enum_plugin_ai_instructions_model_id";
  DROP TYPE "public"."enum_plugin_ai_instructions_oai_text_settings_model";
  DROP TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_version";
  DROP TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_size";
  DROP TYPE "public"."enum_plugin_ai_instructions_dalle_e_settings_style";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_version";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_size";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_quality";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_output_format";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_background";
  DROP TYPE "public"."enum_plugin_ai_instructions_gpt_image_1_settings_moderation";
  DROP TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_voice";
  DROP TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_model";
  DROP TYPE "public"."enum_plugin_ai_instructions_oai_tts_settings_response_format";
  DROP TYPE "public"."enum_plugin_ai_instructions_oai_object_settings_model";`)
}
