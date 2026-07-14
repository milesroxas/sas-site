import * as migration_20260322_233115_initial from './20260322_233115_initial'
import * as migration_20260713_200739_content_hub from './20260713_200739_content_hub'
import * as migration_20260713_201056_project_status_enum from './20260713_201056_project_status_enum'
import * as migration_20260713_212452_separate_work_pages_asset_libraries from './20260713_212452_separate_work_pages_asset_libraries'
import * as migration_20260714_022009_website_ia_expansion from './20260714_022009_website_ia_expansion'
import * as migration_20260714_032150_newsletter from './20260714_032150_newsletter'
import * as migration_20260714_154453_lab from './20260714_154453_lab'
import * as migration_20260714_155123_aeo_site_info from './20260714_155123_aeo_site_info'

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
]
