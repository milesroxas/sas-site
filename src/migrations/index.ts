import * as migration_20260322_233115_initial from './20260322_233115_initial';
import * as migration_20260713_200739_content_hub from './20260713_200739_content_hub';
import * as migration_20260713_201056_project_status_enum from './20260713_201056_project_status_enum';
import * as migration_20260713_212452_separate_work_pages_asset_libraries from './20260713_212452_separate_work_pages_asset_libraries';
import * as migration_20260714_022009_website_ia_expansion from './20260714_022009_website_ia_expansion';
import * as migration_20260714_032150_newsletter from './20260714_032150_newsletter';
import * as migration_20260714_154453_lab from './20260714_154453_lab';
import * as migration_20260714_155123_aeo_site_info from './20260714_155123_aeo_site_info';
import * as migration_20260714_173458_mediablock_presentation from './20260714_173458_mediablock_presentation';
import * as migration_20260714_173641_ask_embeddings from './20260714_173641_ask_embeddings';
import * as migration_20260719_140027_feature_statement_grid from './20260719_140027_feature_statement_grid';
import * as migration_20260719_142151_orderable_collections from './20260719_142151_orderable_collections';
import * as migration_20260719_142433_drop_legacy_order from './20260719_142433_drop_legacy_order';
import * as migration_20260721_002854_image_statement from './20260721_002854_image_statement';
import * as migration_20260721_221944_r2_video_poster from './20260721_221944_r2_video_poster';
import * as migration_20260722_160300_work_page_feature_blocks from './20260722_160300_work_page_feature_blocks';
import * as migration_20260722_161500_media_all_channels from './20260722_161500_media_all_channels';
import * as migration_20260722_174221_per_parent_block_tables from './20260722_174221_per_parent_block_tables';
import * as migration_20260722_183757_mcp_authoring_capabilities from './20260722_183757_mcp_authoring_capabilities';
import * as migration_20260723_162716_add_post_hero_style from './20260723_162716_add_post_hero_style';

export const migrations = [
  {
    up: migration_20260322_233115_initial.up,
    down: migration_20260322_233115_initial.down,
    name: '20260322_233115_initial',
  },
  {
    up: migration_20260713_200739_content_hub.up,
    down: migration_20260713_200739_content_hub.down,
    name: '20260713_200739_content_hub',
  },
  {
    up: migration_20260713_201056_project_status_enum.up,
    down: migration_20260713_201056_project_status_enum.down,
    name: '20260713_201056_project_status_enum',
  },
  {
    up: migration_20260713_212452_separate_work_pages_asset_libraries.up,
    down: migration_20260713_212452_separate_work_pages_asset_libraries.down,
    name: '20260713_212452_separate_work_pages_asset_libraries',
  },
  {
    up: migration_20260714_022009_website_ia_expansion.up,
    down: migration_20260714_022009_website_ia_expansion.down,
    name: '20260714_022009_website_ia_expansion',
  },
  {
    up: migration_20260714_032150_newsletter.up,
    down: migration_20260714_032150_newsletter.down,
    name: '20260714_032150_newsletter',
  },
  {
    up: migration_20260714_154453_lab.up,
    down: migration_20260714_154453_lab.down,
    name: '20260714_154453_lab',
  },
  {
    up: migration_20260714_155123_aeo_site_info.up,
    down: migration_20260714_155123_aeo_site_info.down,
    name: '20260714_155123_aeo_site_info',
  },
  {
    up: migration_20260714_173458_mediablock_presentation.up,
    down: migration_20260714_173458_mediablock_presentation.down,
    name: '20260714_173458_mediablock_presentation',
  },
  {
    up: migration_20260714_173641_ask_embeddings.up,
    down: migration_20260714_173641_ask_embeddings.down,
    name: '20260714_173641_ask_embeddings',
  },
  {
    up: migration_20260719_140027_feature_statement_grid.up,
    down: migration_20260719_140027_feature_statement_grid.down,
    name: '20260719_140027_feature_statement_grid',
  },
  {
    up: migration_20260719_142151_orderable_collections.up,
    down: migration_20260719_142151_orderable_collections.down,
    name: '20260719_142151_orderable_collections',
  },
  {
    up: migration_20260719_142433_drop_legacy_order.up,
    down: migration_20260719_142433_drop_legacy_order.down,
    name: '20260719_142433_drop_legacy_order',
  },
  {
    up: migration_20260721_002854_image_statement.up,
    down: migration_20260721_002854_image_statement.down,
    name: '20260721_002854_image_statement',
  },
  {
    up: migration_20260721_221944_r2_video_poster.up,
    down: migration_20260721_221944_r2_video_poster.down,
    name: '20260721_221944_r2_video_poster',
  },
  {
    up: migration_20260722_160300_work_page_feature_blocks.up,
    down: migration_20260722_160300_work_page_feature_blocks.down,
    name: '20260722_160300_work_page_feature_blocks',
  },
  {
    up: migration_20260722_161500_media_all_channels.up,
    down: migration_20260722_161500_media_all_channels.down,
    name: '20260722_161500_media_all_channels',
  },
  {
    up: migration_20260722_174221_per_parent_block_tables.up,
    down: migration_20260722_174221_per_parent_block_tables.down,
    name: '20260722_174221_per_parent_block_tables',
  },
  {
    up: migration_20260722_183757_mcp_authoring_capabilities.up,
    down: migration_20260722_183757_mcp_authoring_capabilities.down,
    name: '20260722_183757_mcp_authoring_capabilities',
  },
  {
    up: migration_20260723_162716_add_post_hero_style.up,
    down: migration_20260723_162716_add_post_hero_style.down,
    name: '20260723_162716_add_post_hero_style'
  },
];
