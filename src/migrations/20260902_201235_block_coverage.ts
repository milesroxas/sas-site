import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_posts_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_posts_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_posts_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_posts_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_posts_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_posts_image_statement_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_posts_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_posts_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___posts_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___posts_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___posts_v_image_statement_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__posts_v_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___posts_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_work_pages_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_work_pages_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__work_pages_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__work_pages_v_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_lab_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_lab_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_lab_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_lab_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_image_statement_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_lab_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_lab_pages_image_statement_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_lab_pages_image_statement_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_lab_pages_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___lab_pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___lab_pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_aspect_ratio" AS ENUM('responsive', '16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_media_block_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_expertise_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_expertise_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_expertise_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_expertise_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_expertise_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_expertise_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_expertise_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_expertise_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___expertise_pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___expertise_pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___expertise_pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___expertise_pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___expertise_pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___expertise_pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___expertise_pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___expertise_pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_audience_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_audience_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_audience_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_audience_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_audience_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_audience_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_audience_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_audience_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___audience_pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___audience_pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___audience_pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___audience_pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___audience_pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___audience_pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___audience_pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___audience_pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_pages_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___pages_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___pages_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___pages_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_posts_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"body_size" "enum_posts_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum_posts_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum_posts_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum_posts_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_posts_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_posts_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_posts_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_posts_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_posts_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_posts_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_posts_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_posts_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_posts_split_narrow_image_position" DEFAULT 'left',
  	"theme" "enum_posts_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_posts_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_posts_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_posts_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_posts_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_posts_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_posts_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_posts_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"source" "enum_posts_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_posts_image_statement_text_position" DEFAULT 'left',
  	"text_size" "enum_posts_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_posts_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_posts_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_posts_image_statement_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_posts_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_posts_blocks_media_block_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_posts_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_posts_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__posts_v_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"body_size" "enum__posts_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum__posts_v_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum___posts_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum___posts_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___posts_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___posts_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___posts_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___posts_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___posts_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___posts_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___posts_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___posts_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___posts_v_split_narrow_v_image_position" DEFAULT 'left',
  	"theme" "enum___posts_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___posts_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___posts_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___posts_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___posts_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___posts_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___posts_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___posts_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"source" "enum___posts_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___posts_v_image_statement_v_text_position" DEFAULT 'left',
  	"text_size" "enum___posts_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___posts_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___posts_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___posts_v_image_statement_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum__posts_v_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum__posts_v_blocks_media_block_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___posts_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___posts_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_work_pages_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_work_pages_blocks_media_block_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum__work_pages_v_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum__work_pages_v_blocks_media_block_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_lab_pages_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"body_size" "enum_lab_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum_lab_pages_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum_lab_pages_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum_lab_pages_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_lab_pages_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_lab_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_lab_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lab_pages_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_lab_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_lab_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_lab_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lab_pages_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_lab_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_lab_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_lab_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lab_pages_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_lab_pages_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_lab_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"source" "enum_lab_pages_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_lab_pages_image_statement_text_position" DEFAULT 'left',
  	"text_size" "enum_lab_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_lab_pages_image_statement_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_lab_pages_image_statement_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum_lab_pages_image_statement_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_lab_pages_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum_lab_pages_blocks_media_block_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__lab_pages_v_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"body_size" "enum__lab_pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium',
  	"theme" "enum__lab_pages_v_blocks_feature_heading_offset_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum___lab_pages_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum___lab_pages_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___lab_pages_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___lab_pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___lab_pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___lab_pages_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___lab_pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___lab_pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___lab_pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___lab_pages_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___lab_pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___lab_pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___lab_pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___lab_pages_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___lab_pages_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___lab_pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"source" "enum___lab_pages_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___lab_pages_v_image_statement_v_text_position" DEFAULT 'left',
  	"text_size" "enum___lab_pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___lab_pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___lab_pages_v_image_statement_v_aspect_ratio" DEFAULT 'responsive',
  	"theme" "enum___lab_pages_v_image_statement_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum__lab_pages_v_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"theme" "enum__lab_pages_v_blocks_media_block_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum_expertise_pages_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum_expertise_pages_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_expertise_pages_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_expertise_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_expertise_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_expertise_pages_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_expertise_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_expertise_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_expertise_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_expertise_pages_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_expertise_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_expertise_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_expertise_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_expertise_pages_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_expertise_pages_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_expertise_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum___expertise_pages_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum___expertise_pages_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___expertise_pages_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___expertise_pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___expertise_pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___expertise_pages_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___expertise_pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___expertise_pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___expertise_pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___expertise_pages_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___expertise_pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___expertise_pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___expertise_pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___expertise_pages_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___expertise_pages_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___expertise_pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum_audience_pages_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum_audience_pages_full_media_width" DEFAULT 'contained',
  	"aspect_ratio" "enum_audience_pages_full_media_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum_audience_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_audience_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_audience_pages_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_audience_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_audience_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_audience_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_audience_pages_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_audience_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_audience_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_audience_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_audience_pages_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_audience_pages_split_offset_caption_position" DEFAULT 'left',
  	"theme" "enum_audience_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_content" boolean DEFAULT true,
  	"source" "enum___audience_pages_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"width" "enum___audience_pages_v_full_media_v_width" DEFAULT 'contained',
  	"aspect_ratio" "enum___audience_pages_v_full_media_v_aspect_ratio" DEFAULT '16-9',
  	"content_position" "enum___audience_pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___audience_pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___audience_pages_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___audience_pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___audience_pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___audience_pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___audience_pages_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___audience_pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___audience_pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___audience_pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___audience_pages_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___audience_pages_v_split_offset_v_caption_position" DEFAULT 'left',
  	"theme" "enum___audience_pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_pair" ADD CONSTRAINT "pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_offset" ADD CONSTRAINT "pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_pair_v" ADD CONSTRAINT "__pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_offset_v" ADD CONSTRAINT "__pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_heading_offset" ADD CONSTRAINT "posts_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_pair" ADD CONSTRAINT "posts_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_offset" ADD CONSTRAINT "posts_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_image_statement" ADD CONSTRAINT "posts_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_image_statement" ADD CONSTRAINT "posts_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_block" ADD CONSTRAINT "posts_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_block" ADD CONSTRAINT "posts_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_section" ADD CONSTRAINT "posts_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_heading_offset" ADD CONSTRAINT "_posts_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_pair_v" ADD CONSTRAINT "__posts_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_offset_v" ADD CONSTRAINT "__posts_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_image_statement_v" ADD CONSTRAINT "__posts_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_image_statement_v" ADD CONSTRAINT "__posts_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_block" ADD CONSTRAINT "_posts_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_block" ADD CONSTRAINT "_posts_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_section_v" ADD CONSTRAINT "__posts_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_media_block" ADD CONSTRAINT "work_pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_media_block" ADD CONSTRAINT "work_pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_media_block" ADD CONSTRAINT "_work_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_media_block" ADD CONSTRAINT "_work_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" ADD CONSTRAINT "lab_pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_full_media" ADD CONSTRAINT "lab_pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_full_media" ADD CONSTRAINT "lab_pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_media_split" ADD CONSTRAINT "lab_pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_media_split" ADD CONSTRAINT "lab_pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_image_pair" ADD CONSTRAINT "lab_pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_image_pair" ADD CONSTRAINT "lab_pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_image_pair" ADD CONSTRAINT "lab_pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_split_offset" ADD CONSTRAINT "lab_pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_split_offset" ADD CONSTRAINT "lab_pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_split_offset" ADD CONSTRAINT "lab_pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_image_statement" ADD CONSTRAINT "lab_pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_image_statement" ADD CONSTRAINT "lab_pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_media_block" ADD CONSTRAINT "lab_pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_media_block" ADD CONSTRAINT "lab_pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_lab_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD CONSTRAINT "__lab_pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD CONSTRAINT "__lab_pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD CONSTRAINT "__lab_pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD CONSTRAINT "__lab_pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD CONSTRAINT "__lab_pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD CONSTRAINT "__lab_pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD CONSTRAINT "__lab_pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD CONSTRAINT "__lab_pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD CONSTRAINT "__lab_pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD CONSTRAINT "__lab_pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_image_statement_v" ADD CONSTRAINT "__lab_pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_image_statement_v" ADD CONSTRAINT "__lab_pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_media_block" ADD CONSTRAINT "_lab_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_media_block" ADD CONSTRAINT "_lab_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_full_media" ADD CONSTRAINT "expertise_pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_full_media" ADD CONSTRAINT "expertise_pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_media_split" ADD CONSTRAINT "expertise_pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_media_split" ADD CONSTRAINT "expertise_pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_image_pair" ADD CONSTRAINT "expertise_pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_image_pair" ADD CONSTRAINT "expertise_pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_image_pair" ADD CONSTRAINT "expertise_pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_offset" ADD CONSTRAINT "expertise_pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_offset" ADD CONSTRAINT "expertise_pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_offset" ADD CONSTRAINT "expertise_pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD CONSTRAINT "__expertise_pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD CONSTRAINT "__expertise_pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD CONSTRAINT "__expertise_pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD CONSTRAINT "__expertise_pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_image_pair_v" ADD CONSTRAINT "__expertise_pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_image_pair_v" ADD CONSTRAINT "__expertise_pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_image_pair_v" ADD CONSTRAINT "__expertise_pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_offset_v" ADD CONSTRAINT "__expertise_pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_offset_v" ADD CONSTRAINT "__expertise_pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_offset_v" ADD CONSTRAINT "__expertise_pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_full_media" ADD CONSTRAINT "audience_pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_full_media" ADD CONSTRAINT "audience_pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_media_split" ADD CONSTRAINT "audience_pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_media_split" ADD CONSTRAINT "audience_pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_image_pair" ADD CONSTRAINT "audience_pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_image_pair" ADD CONSTRAINT "audience_pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_image_pair" ADD CONSTRAINT "audience_pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_split_offset" ADD CONSTRAINT "audience_pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_split_offset" ADD CONSTRAINT "audience_pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_split_offset" ADD CONSTRAINT "audience_pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD CONSTRAINT "__audience_pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD CONSTRAINT "__audience_pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD CONSTRAINT "__audience_pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD CONSTRAINT "__audience_pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_image_pair_v" ADD CONSTRAINT "__audience_pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_image_pair_v" ADD CONSTRAINT "__audience_pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_image_pair_v" ADD CONSTRAINT "__audience_pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_offset_v" ADD CONSTRAINT "__audience_pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_offset_v" ADD CONSTRAINT "__audience_pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_offset_v" ADD CONSTRAINT "__audience_pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_image_pair_order_idx" ON "pages_image_pair" USING btree ("_order");
  CREATE INDEX "pages_image_pair_parent_id_idx" ON "pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "pages_image_pair_path_idx" ON "pages_image_pair" USING btree ("_path");
  CREATE INDEX "pages_image_pair_portrait_media_idx" ON "pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "pages_image_pair_landscape_media_idx" ON "pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "pages_split_offset_order_idx" ON "pages_split_offset" USING btree ("_order");
  CREATE INDEX "pages_split_offset_parent_id_idx" ON "pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "pages_split_offset_path_idx" ON "pages_split_offset" USING btree ("_path");
  CREATE INDEX "pages_split_offset_large_media_idx" ON "pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "pages_split_offset_small_media_idx" ON "pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "__pages_v_image_pair_v_order_idx" ON "__pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__pages_v_image_pair_v_parent_id_idx" ON "__pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_image_pair_v_path_idx" ON "__pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__pages_v_image_pair_v_portrait_media_idx" ON "__pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__pages_v_image_pair_v_landscape_media_idx" ON "__pages_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__pages_v_split_offset_v_order_idx" ON "__pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__pages_v_split_offset_v_parent_id_idx" ON "__pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_split_offset_v_path_idx" ON "__pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__pages_v_split_offset_v_large_media_idx" ON "__pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__pages_v_split_offset_v_small_media_idx" ON "__pages_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "posts_blocks_feature_heading_offset_order_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_heading_offset_parent_id_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_heading_offset_path_idx" ON "posts_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "posts_full_media_order_idx" ON "posts_full_media" USING btree ("_order");
  CREATE INDEX "posts_full_media_parent_id_idx" ON "posts_full_media" USING btree ("_parent_id");
  CREATE INDEX "posts_full_media_path_idx" ON "posts_full_media" USING btree ("_path");
  CREATE INDEX "posts_full_media_media_idx" ON "posts_full_media" USING btree ("media_id");
  CREATE INDEX "posts_media_split_order_idx" ON "posts_media_split" USING btree ("_order");
  CREATE INDEX "posts_media_split_parent_id_idx" ON "posts_media_split" USING btree ("_parent_id");
  CREATE INDEX "posts_media_split_path_idx" ON "posts_media_split" USING btree ("_path");
  CREATE INDEX "posts_media_split_media_idx" ON "posts_media_split" USING btree ("media_id");
  CREATE INDEX "posts_split_narrow_order_idx" ON "posts_split_narrow" USING btree ("_order");
  CREATE INDEX "posts_split_narrow_parent_id_idx" ON "posts_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "posts_split_narrow_path_idx" ON "posts_split_narrow" USING btree ("_path");
  CREATE INDEX "posts_split_narrow_media_idx" ON "posts_split_narrow" USING btree ("media_id");
  CREATE INDEX "posts_image_pair_order_idx" ON "posts_image_pair" USING btree ("_order");
  CREATE INDEX "posts_image_pair_parent_id_idx" ON "posts_image_pair" USING btree ("_parent_id");
  CREATE INDEX "posts_image_pair_path_idx" ON "posts_image_pair" USING btree ("_path");
  CREATE INDEX "posts_image_pair_portrait_media_idx" ON "posts_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "posts_image_pair_landscape_media_idx" ON "posts_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "posts_split_offset_order_idx" ON "posts_split_offset" USING btree ("_order");
  CREATE INDEX "posts_split_offset_parent_id_idx" ON "posts_split_offset" USING btree ("_parent_id");
  CREATE INDEX "posts_split_offset_path_idx" ON "posts_split_offset" USING btree ("_path");
  CREATE INDEX "posts_split_offset_large_media_idx" ON "posts_split_offset" USING btree ("large_media_id");
  CREATE INDEX "posts_split_offset_small_media_idx" ON "posts_split_offset" USING btree ("small_media_id");
  CREATE INDEX "posts_image_statement_order_idx" ON "posts_image_statement" USING btree ("_order");
  CREATE INDEX "posts_image_statement_parent_id_idx" ON "posts_image_statement" USING btree ("_parent_id");
  CREATE INDEX "posts_image_statement_path_idx" ON "posts_image_statement" USING btree ("_path");
  CREATE INDEX "posts_image_statement_media_idx" ON "posts_image_statement" USING btree ("media_id");
  CREATE INDEX "posts_blocks_media_block_order_idx" ON "posts_blocks_media_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_media_block_parent_id_idx" ON "posts_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_media_block_path_idx" ON "posts_blocks_media_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_media_block_media_idx" ON "posts_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "posts_section_order_idx" ON "posts_section" USING btree ("_order");
  CREATE INDEX "posts_section_parent_id_idx" ON "posts_section" USING btree ("_parent_id");
  CREATE INDEX "posts_section_path_idx" ON "posts_section" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_order_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_parent_id_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_heading_offset_path_idx" ON "_posts_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__posts_v_full_media_v_order_idx" ON "__posts_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__posts_v_full_media_v_parent_id_idx" ON "__posts_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_full_media_v_path_idx" ON "__posts_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__posts_v_full_media_v_media_idx" ON "__posts_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_media_split_v_order_idx" ON "__posts_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__posts_v_media_split_v_parent_id_idx" ON "__posts_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_media_split_v_path_idx" ON "__posts_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__posts_v_media_split_v_media_idx" ON "__posts_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_split_narrow_v_order_idx" ON "__posts_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__posts_v_split_narrow_v_parent_id_idx" ON "__posts_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_split_narrow_v_path_idx" ON "__posts_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__posts_v_split_narrow_v_media_idx" ON "__posts_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__posts_v_image_pair_v_order_idx" ON "__posts_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__posts_v_image_pair_v_parent_id_idx" ON "__posts_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_image_pair_v_path_idx" ON "__posts_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__posts_v_image_pair_v_portrait_media_idx" ON "__posts_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__posts_v_image_pair_v_landscape_media_idx" ON "__posts_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__posts_v_split_offset_v_order_idx" ON "__posts_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__posts_v_split_offset_v_parent_id_idx" ON "__posts_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_split_offset_v_path_idx" ON "__posts_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__posts_v_split_offset_v_large_media_idx" ON "__posts_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__posts_v_split_offset_v_small_media_idx" ON "__posts_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__posts_v_image_statement_v_order_idx" ON "__posts_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__posts_v_image_statement_v_parent_id_idx" ON "__posts_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_image_statement_v_path_idx" ON "__posts_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__posts_v_image_statement_v_media_idx" ON "__posts_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_media_block_order_idx" ON "_posts_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_media_block_parent_id_idx" ON "_posts_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_media_block_path_idx" ON "_posts_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_media_block_media_idx" ON "_posts_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "__posts_v_section_v_order_idx" ON "__posts_v_section_v" USING btree ("_order");
  CREATE INDEX "__posts_v_section_v_parent_id_idx" ON "__posts_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_section_v_path_idx" ON "__posts_v_section_v" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_media_block_order_idx" ON "work_pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_media_block_parent_id_idx" ON "work_pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_media_block_path_idx" ON "work_pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_media_block_media_idx" ON "work_pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_blocks_media_block_order_idx" ON "_work_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_media_block_parent_id_idx" ON "_work_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_media_block_path_idx" ON "_work_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_media_block_media_idx" ON "_work_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_feature_heading_offset_order_idx" ON "lab_pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_heading_offset_parent_id_idx" ON "lab_pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_heading_offset_path_idx" ON "lab_pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "lab_pages_full_media_order_idx" ON "lab_pages_full_media" USING btree ("_order");
  CREATE INDEX "lab_pages_full_media_parent_id_idx" ON "lab_pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_full_media_path_idx" ON "lab_pages_full_media" USING btree ("_path");
  CREATE INDEX "lab_pages_full_media_media_idx" ON "lab_pages_full_media" USING btree ("media_id");
  CREATE INDEX "lab_pages_media_split_order_idx" ON "lab_pages_media_split" USING btree ("_order");
  CREATE INDEX "lab_pages_media_split_parent_id_idx" ON "lab_pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_media_split_path_idx" ON "lab_pages_media_split" USING btree ("_path");
  CREATE INDEX "lab_pages_media_split_media_idx" ON "lab_pages_media_split" USING btree ("media_id");
  CREATE INDEX "lab_pages_image_pair_order_idx" ON "lab_pages_image_pair" USING btree ("_order");
  CREATE INDEX "lab_pages_image_pair_parent_id_idx" ON "lab_pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_image_pair_path_idx" ON "lab_pages_image_pair" USING btree ("_path");
  CREATE INDEX "lab_pages_image_pair_portrait_media_idx" ON "lab_pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "lab_pages_image_pair_landscape_media_idx" ON "lab_pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "lab_pages_split_offset_order_idx" ON "lab_pages_split_offset" USING btree ("_order");
  CREATE INDEX "lab_pages_split_offset_parent_id_idx" ON "lab_pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_split_offset_path_idx" ON "lab_pages_split_offset" USING btree ("_path");
  CREATE INDEX "lab_pages_split_offset_large_media_idx" ON "lab_pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "lab_pages_split_offset_small_media_idx" ON "lab_pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "lab_pages_image_statement_order_idx" ON "lab_pages_image_statement" USING btree ("_order");
  CREATE INDEX "lab_pages_image_statement_parent_id_idx" ON "lab_pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_image_statement_path_idx" ON "lab_pages_image_statement" USING btree ("_path");
  CREATE INDEX "lab_pages_image_statement_media_idx" ON "lab_pages_image_statement" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_media_block_order_idx" ON "lab_pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_media_block_parent_id_idx" ON "lab_pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_media_block_path_idx" ON "lab_pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_media_block_media_idx" ON "lab_pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_heading_offset_order_idx" ON "_lab_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_lab_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_heading_offset_path_idx" ON "_lab_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_full_media_v_order_idx" ON "__lab_pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_full_media_v_parent_id_idx" ON "__lab_pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_full_media_v_path_idx" ON "__lab_pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_full_media_v_media_idx" ON "__lab_pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_media_split_v_order_idx" ON "__lab_pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_media_split_v_parent_id_idx" ON "__lab_pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_media_split_v_path_idx" ON "__lab_pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_media_split_v_media_idx" ON "__lab_pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_image_pair_v_order_idx" ON "__lab_pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_image_pair_v_parent_id_idx" ON "__lab_pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_image_pair_v_path_idx" ON "__lab_pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_image_pair_v_portrait_media_idx" ON "__lab_pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__lab_pages_v_image_pair_v_landscape_media_idx" ON "__lab_pages_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__lab_pages_v_split_offset_v_order_idx" ON "__lab_pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_split_offset_v_parent_id_idx" ON "__lab_pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_split_offset_v_path_idx" ON "__lab_pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_split_offset_v_large_media_idx" ON "__lab_pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__lab_pages_v_split_offset_v_small_media_idx" ON "__lab_pages_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "__lab_pages_v_image_statement_v_order_idx" ON "__lab_pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_image_statement_v_parent_id_idx" ON "__lab_pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_image_statement_v_path_idx" ON "__lab_pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_image_statement_v_media_idx" ON "__lab_pages_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_media_block_order_idx" ON "_lab_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_media_block_parent_id_idx" ON "_lab_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_media_block_path_idx" ON "_lab_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_media_block_media_idx" ON "_lab_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "expertise_pages_full_media_order_idx" ON "expertise_pages_full_media" USING btree ("_order");
  CREATE INDEX "expertise_pages_full_media_parent_id_idx" ON "expertise_pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_full_media_path_idx" ON "expertise_pages_full_media" USING btree ("_path");
  CREATE INDEX "expertise_pages_full_media_media_idx" ON "expertise_pages_full_media" USING btree ("media_id");
  CREATE INDEX "expertise_pages_media_split_order_idx" ON "expertise_pages_media_split" USING btree ("_order");
  CREATE INDEX "expertise_pages_media_split_parent_id_idx" ON "expertise_pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_media_split_path_idx" ON "expertise_pages_media_split" USING btree ("_path");
  CREATE INDEX "expertise_pages_media_split_media_idx" ON "expertise_pages_media_split" USING btree ("media_id");
  CREATE INDEX "expertise_pages_image_pair_order_idx" ON "expertise_pages_image_pair" USING btree ("_order");
  CREATE INDEX "expertise_pages_image_pair_parent_id_idx" ON "expertise_pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_image_pair_path_idx" ON "expertise_pages_image_pair" USING btree ("_path");
  CREATE INDEX "expertise_pages_image_pair_portrait_media_idx" ON "expertise_pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "expertise_pages_image_pair_landscape_media_idx" ON "expertise_pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "expertise_pages_split_offset_order_idx" ON "expertise_pages_split_offset" USING btree ("_order");
  CREATE INDEX "expertise_pages_split_offset_parent_id_idx" ON "expertise_pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_split_offset_path_idx" ON "expertise_pages_split_offset" USING btree ("_path");
  CREATE INDEX "expertise_pages_split_offset_large_media_idx" ON "expertise_pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "expertise_pages_split_offset_small_media_idx" ON "expertise_pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "__expertise_pages_v_full_media_v_order_idx" ON "__expertise_pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_full_media_v_parent_id_idx" ON "__expertise_pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_full_media_v_path_idx" ON "__expertise_pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_full_media_v_media_idx" ON "__expertise_pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_media_split_v_order_idx" ON "__expertise_pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_media_split_v_parent_id_idx" ON "__expertise_pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_media_split_v_path_idx" ON "__expertise_pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_media_split_v_media_idx" ON "__expertise_pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_image_pair_v_order_idx" ON "__expertise_pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_image_pair_v_parent_id_idx" ON "__expertise_pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_image_pair_v_path_idx" ON "__expertise_pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_image_pair_v_portrait_media_idx" ON "__expertise_pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__expertise_pages_v_image_pair_v_landscape_media_idx" ON "__expertise_pages_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__expertise_pages_v_split_offset_v_order_idx" ON "__expertise_pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_split_offset_v_parent_id_idx" ON "__expertise_pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_split_offset_v_path_idx" ON "__expertise_pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_split_offset_v_large_media_idx" ON "__expertise_pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__expertise_pages_v_split_offset_v_small_media_idx" ON "__expertise_pages_v_split_offset_v" USING btree ("small_media_id");
  CREATE INDEX "audience_pages_full_media_order_idx" ON "audience_pages_full_media" USING btree ("_order");
  CREATE INDEX "audience_pages_full_media_parent_id_idx" ON "audience_pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_full_media_path_idx" ON "audience_pages_full_media" USING btree ("_path");
  CREATE INDEX "audience_pages_full_media_media_idx" ON "audience_pages_full_media" USING btree ("media_id");
  CREATE INDEX "audience_pages_media_split_order_idx" ON "audience_pages_media_split" USING btree ("_order");
  CREATE INDEX "audience_pages_media_split_parent_id_idx" ON "audience_pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_media_split_path_idx" ON "audience_pages_media_split" USING btree ("_path");
  CREATE INDEX "audience_pages_media_split_media_idx" ON "audience_pages_media_split" USING btree ("media_id");
  CREATE INDEX "audience_pages_image_pair_order_idx" ON "audience_pages_image_pair" USING btree ("_order");
  CREATE INDEX "audience_pages_image_pair_parent_id_idx" ON "audience_pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_image_pair_path_idx" ON "audience_pages_image_pair" USING btree ("_path");
  CREATE INDEX "audience_pages_image_pair_portrait_media_idx" ON "audience_pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "audience_pages_image_pair_landscape_media_idx" ON "audience_pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "audience_pages_split_offset_order_idx" ON "audience_pages_split_offset" USING btree ("_order");
  CREATE INDEX "audience_pages_split_offset_parent_id_idx" ON "audience_pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_split_offset_path_idx" ON "audience_pages_split_offset" USING btree ("_path");
  CREATE INDEX "audience_pages_split_offset_large_media_idx" ON "audience_pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "audience_pages_split_offset_small_media_idx" ON "audience_pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "__audience_pages_v_full_media_v_order_idx" ON "__audience_pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_full_media_v_parent_id_idx" ON "__audience_pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_full_media_v_path_idx" ON "__audience_pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_full_media_v_media_idx" ON "__audience_pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_media_split_v_order_idx" ON "__audience_pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_media_split_v_parent_id_idx" ON "__audience_pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_media_split_v_path_idx" ON "__audience_pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_media_split_v_media_idx" ON "__audience_pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_image_pair_v_order_idx" ON "__audience_pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_image_pair_v_parent_id_idx" ON "__audience_pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_image_pair_v_path_idx" ON "__audience_pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_image_pair_v_portrait_media_idx" ON "__audience_pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__audience_pages_v_image_pair_v_landscape_media_idx" ON "__audience_pages_v_image_pair_v" USING btree ("landscape_media_id");
  CREATE INDEX "__audience_pages_v_split_offset_v_order_idx" ON "__audience_pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_split_offset_v_parent_id_idx" ON "__audience_pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_split_offset_v_path_idx" ON "__audience_pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_split_offset_v_large_media_idx" ON "__audience_pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__audience_pages_v_split_offset_v_small_media_idx" ON "__audience_pages_v_split_offset_v" USING btree ("small_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_image_pair" CASCADE;
  DROP TABLE "pages_split_offset" CASCADE;
  DROP TABLE "__pages_v_image_pair_v" CASCADE;
  DROP TABLE "__pages_v_split_offset_v" CASCADE;
  DROP TABLE "posts_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "posts_full_media" CASCADE;
  DROP TABLE "posts_media_split" CASCADE;
  DROP TABLE "posts_split_narrow" CASCADE;
  DROP TABLE "posts_image_pair" CASCADE;
  DROP TABLE "posts_split_offset" CASCADE;
  DROP TABLE "posts_image_statement" CASCADE;
  DROP TABLE "posts_blocks_media_block" CASCADE;
  DROP TABLE "posts_section" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__posts_v_full_media_v" CASCADE;
  DROP TABLE "__posts_v_media_split_v" CASCADE;
  DROP TABLE "__posts_v_split_narrow_v" CASCADE;
  DROP TABLE "__posts_v_image_pair_v" CASCADE;
  DROP TABLE "__posts_v_split_offset_v" CASCADE;
  DROP TABLE "__posts_v_image_statement_v" CASCADE;
  DROP TABLE "_posts_v_blocks_media_block" CASCADE;
  DROP TABLE "__posts_v_section_v" CASCADE;
  DROP TABLE "work_pages_blocks_media_block" CASCADE;
  DROP TABLE "_work_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "lab_pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "lab_pages_full_media" CASCADE;
  DROP TABLE "lab_pages_media_split" CASCADE;
  DROP TABLE "lab_pages_image_pair" CASCADE;
  DROP TABLE "lab_pages_split_offset" CASCADE;
  DROP TABLE "lab_pages_image_statement" CASCADE;
  DROP TABLE "lab_pages_blocks_media_block" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "__lab_pages_v_full_media_v" CASCADE;
  DROP TABLE "__lab_pages_v_media_split_v" CASCADE;
  DROP TABLE "__lab_pages_v_image_pair_v" CASCADE;
  DROP TABLE "__lab_pages_v_split_offset_v" CASCADE;
  DROP TABLE "__lab_pages_v_image_statement_v" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "expertise_pages_full_media" CASCADE;
  DROP TABLE "expertise_pages_media_split" CASCADE;
  DROP TABLE "expertise_pages_image_pair" CASCADE;
  DROP TABLE "expertise_pages_split_offset" CASCADE;
  DROP TABLE "__expertise_pages_v_full_media_v" CASCADE;
  DROP TABLE "__expertise_pages_v_media_split_v" CASCADE;
  DROP TABLE "__expertise_pages_v_image_pair_v" CASCADE;
  DROP TABLE "__expertise_pages_v_split_offset_v" CASCADE;
  DROP TABLE "audience_pages_full_media" CASCADE;
  DROP TABLE "audience_pages_media_split" CASCADE;
  DROP TABLE "audience_pages_image_pair" CASCADE;
  DROP TABLE "audience_pages_split_offset" CASCADE;
  DROP TABLE "__audience_pages_v_full_media_v" CASCADE;
  DROP TABLE "__audience_pages_v_media_split_v" CASCADE;
  DROP TABLE "__audience_pages_v_image_pair_v" CASCADE;
  DROP TABLE "__audience_pages_v_split_offset_v" CASCADE;
  DROP TYPE "public"."enum_pages_image_pair_source";
  DROP TYPE "public"."enum_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_pages_image_pair_text_position";
  DROP TYPE "public"."enum_pages_image_pair_theme";
  DROP TYPE "public"."enum_pages_split_offset_source";
  DROP TYPE "public"."enum_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_pages_split_offset_theme";
  DROP TYPE "public"."enum___pages_v_image_pair_v_source";
  DROP TYPE "public"."enum___pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___pages_v_image_pair_v_theme";
  DROP TYPE "public"."enum___pages_v_split_offset_v_source";
  DROP TYPE "public"."enum___pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___pages_v_split_offset_v_theme";
  DROP TYPE "public"."enum_posts_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_posts_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_posts_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_posts_full_media_source";
  DROP TYPE "public"."enum_posts_full_media_width";
  DROP TYPE "public"."enum_posts_full_media_aspect_ratio";
  DROP TYPE "public"."enum_posts_full_media_content_position";
  DROP TYPE "public"."enum_posts_full_media_theme";
  DROP TYPE "public"."enum_posts_media_split_source";
  DROP TYPE "public"."enum_posts_media_split_layout";
  DROP TYPE "public"."enum_posts_media_split_aspect_ratio";
  DROP TYPE "public"."enum_posts_media_split_theme";
  DROP TYPE "public"."enum_posts_split_narrow_source";
  DROP TYPE "public"."enum_posts_split_narrow_image_position";
  DROP TYPE "public"."enum_posts_split_narrow_theme";
  DROP TYPE "public"."enum_posts_image_pair_source";
  DROP TYPE "public"."enum_posts_image_pair_portrait_position";
  DROP TYPE "public"."enum_posts_image_pair_text_position";
  DROP TYPE "public"."enum_posts_image_pair_theme";
  DROP TYPE "public"."enum_posts_split_offset_source";
  DROP TYPE "public"."enum_posts_split_offset_caption_position";
  DROP TYPE "public"."enum_posts_split_offset_theme";
  DROP TYPE "public"."enum_posts_image_statement_source";
  DROP TYPE "public"."enum_posts_image_statement_text_position";
  DROP TYPE "public"."enum_posts_image_statement_text_size";
  DROP TYPE "public"."enum_posts_image_statement_image_width";
  DROP TYPE "public"."enum_posts_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_posts_image_statement_theme";
  DROP TYPE "public"."enum_posts_blocks_media_block_size";
  DROP TYPE "public"."enum_posts_blocks_media_block_theme";
  DROP TYPE "public"."enum_posts_section_theme";
  DROP TYPE "public"."enum_posts_section_spacing";
  DROP TYPE "public"."enum__posts_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__posts_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum__posts_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___posts_v_full_media_v_source";
  DROP TYPE "public"."enum___posts_v_full_media_v_width";
  DROP TYPE "public"."enum___posts_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_full_media_v_content_position";
  DROP TYPE "public"."enum___posts_v_full_media_v_theme";
  DROP TYPE "public"."enum___posts_v_media_split_v_source";
  DROP TYPE "public"."enum___posts_v_media_split_v_layout";
  DROP TYPE "public"."enum___posts_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_media_split_v_theme";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_source";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___posts_v_split_narrow_v_theme";
  DROP TYPE "public"."enum___posts_v_image_pair_v_source";
  DROP TYPE "public"."enum___posts_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___posts_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___posts_v_image_pair_v_theme";
  DROP TYPE "public"."enum___posts_v_split_offset_v_source";
  DROP TYPE "public"."enum___posts_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___posts_v_split_offset_v_theme";
  DROP TYPE "public"."enum___posts_v_image_statement_v_source";
  DROP TYPE "public"."enum___posts_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___posts_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___posts_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___posts_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___posts_v_image_statement_v_theme";
  DROP TYPE "public"."enum__posts_v_blocks_media_block_size";
  DROP TYPE "public"."enum__posts_v_blocks_media_block_theme";
  DROP TYPE "public"."enum___posts_v_section_v_theme";
  DROP TYPE "public"."enum___posts_v_section_v_spacing";
  DROP TYPE "public"."enum_work_pages_blocks_media_block_size";
  DROP TYPE "public"."enum_work_pages_blocks_media_block_theme";
  DROP TYPE "public"."enum__work_pages_v_blocks_media_block_size";
  DROP TYPE "public"."enum__work_pages_v_blocks_media_block_theme";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum_lab_pages_full_media_source";
  DROP TYPE "public"."enum_lab_pages_full_media_width";
  DROP TYPE "public"."enum_lab_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum_lab_pages_full_media_content_position";
  DROP TYPE "public"."enum_lab_pages_full_media_theme";
  DROP TYPE "public"."enum_lab_pages_media_split_source";
  DROP TYPE "public"."enum_lab_pages_media_split_layout";
  DROP TYPE "public"."enum_lab_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_lab_pages_media_split_theme";
  DROP TYPE "public"."enum_lab_pages_image_pair_source";
  DROP TYPE "public"."enum_lab_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_lab_pages_image_pair_text_position";
  DROP TYPE "public"."enum_lab_pages_image_pair_theme";
  DROP TYPE "public"."enum_lab_pages_split_offset_source";
  DROP TYPE "public"."enum_lab_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_lab_pages_split_offset_theme";
  DROP TYPE "public"."enum_lab_pages_image_statement_source";
  DROP TYPE "public"."enum_lab_pages_image_statement_text_position";
  DROP TYPE "public"."enum_lab_pages_image_statement_text_size";
  DROP TYPE "public"."enum_lab_pages_image_statement_image_width";
  DROP TYPE "public"."enum_lab_pages_image_statement_aspect_ratio";
  DROP TYPE "public"."enum_lab_pages_image_statement_theme";
  DROP TYPE "public"."enum_lab_pages_blocks_media_block_size";
  DROP TYPE "public"."enum_lab_pages_blocks_media_block_theme";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_theme";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_source";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_width";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_media_split_v_source";
  DROP TYPE "public"."enum___lab_pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___lab_pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___lab_pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_image_pair_v_source";
  DROP TYPE "public"."enum___lab_pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___lab_pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___lab_pages_v_image_pair_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_split_offset_v_source";
  DROP TYPE "public"."enum___lab_pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___lab_pages_v_split_offset_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_source";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_aspect_ratio";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_theme";
  DROP TYPE "public"."enum__lab_pages_v_blocks_media_block_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_media_block_theme";
  DROP TYPE "public"."enum_expertise_pages_full_media_source";
  DROP TYPE "public"."enum_expertise_pages_full_media_width";
  DROP TYPE "public"."enum_expertise_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum_expertise_pages_full_media_content_position";
  DROP TYPE "public"."enum_expertise_pages_full_media_theme";
  DROP TYPE "public"."enum_expertise_pages_media_split_source";
  DROP TYPE "public"."enum_expertise_pages_media_split_layout";
  DROP TYPE "public"."enum_expertise_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_expertise_pages_media_split_theme";
  DROP TYPE "public"."enum_expertise_pages_image_pair_source";
  DROP TYPE "public"."enum_expertise_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_expertise_pages_image_pair_text_position";
  DROP TYPE "public"."enum_expertise_pages_image_pair_theme";
  DROP TYPE "public"."enum_expertise_pages_split_offset_source";
  DROP TYPE "public"."enum_expertise_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_expertise_pages_split_offset_theme";
  DROP TYPE "public"."enum___expertise_pages_v_full_media_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_full_media_v_width";
  DROP TYPE "public"."enum___expertise_pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___expertise_pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___expertise_pages_v_full_media_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_media_split_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___expertise_pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___expertise_pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_image_pair_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___expertise_pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___expertise_pages_v_image_pair_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_split_offset_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___expertise_pages_v_split_offset_v_theme";
  DROP TYPE "public"."enum_audience_pages_full_media_source";
  DROP TYPE "public"."enum_audience_pages_full_media_width";
  DROP TYPE "public"."enum_audience_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum_audience_pages_full_media_content_position";
  DROP TYPE "public"."enum_audience_pages_full_media_theme";
  DROP TYPE "public"."enum_audience_pages_media_split_source";
  DROP TYPE "public"."enum_audience_pages_media_split_layout";
  DROP TYPE "public"."enum_audience_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_audience_pages_media_split_theme";
  DROP TYPE "public"."enum_audience_pages_image_pair_source";
  DROP TYPE "public"."enum_audience_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_audience_pages_image_pair_text_position";
  DROP TYPE "public"."enum_audience_pages_image_pair_theme";
  DROP TYPE "public"."enum_audience_pages_split_offset_source";
  DROP TYPE "public"."enum_audience_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_audience_pages_split_offset_theme";
  DROP TYPE "public"."enum___audience_pages_v_full_media_v_source";
  DROP TYPE "public"."enum___audience_pages_v_full_media_v_width";
  DROP TYPE "public"."enum___audience_pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum___audience_pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___audience_pages_v_full_media_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_media_split_v_source";
  DROP TYPE "public"."enum___audience_pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___audience_pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___audience_pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_image_pair_v_source";
  DROP TYPE "public"."enum___audience_pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___audience_pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___audience_pages_v_image_pair_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_split_offset_v_source";
  DROP TYPE "public"."enum___audience_pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___audience_pages_v_split_offset_v_theme";`)
}
