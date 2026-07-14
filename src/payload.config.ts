import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { defaultLexical } from '@/fields/defaultLexical'
import { AssetLibraries } from './collections/AssetLibraries'
import { AudiencePages } from './collections/AudiencePages'
import { Audiences } from './collections/Audiences'
import { Capabilities } from './collections/Capabilities'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { ExpertisePages } from './collections/ExpertisePages'
import { Industries } from './collections/Industries'
import { LabPages } from './collections/LabPages'
import { LabProjects } from './collections/LabProjects'
import { Media } from './collections/Media'
import { Newsletters } from './collections/Newsletters'
import { Organizations } from './collections/Organizations'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Subscribers } from './collections/Subscribers'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { WorkPages } from './collections/WorkPages'
import { askPublicEndpoints } from './endpoints/ask'
import { newsletterPublicEndpoints } from './endpoints/newsletter'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { newsletterSendTask } from './jobs/newsletterSend'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      graphics: {
        Icon: '@/components/AdminIcon#AdminIcon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      icons: [
        { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
        { rel: 'icon', sizes: '32x32', url: '/favicon.ico' },
      ],
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'noreply@example.com',
    defaultFromName: process.env.RESEND_FROM_NAME || 'Suits & Sandals',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [
    // Website — publishing surfaces with public URLs
    Pages,
    Posts,
    WorkPages,
    LabPages,
    ExpertisePages,
    AudiencePages,
    // Content Hub — canonical, channel-agnostic source material
    Organizations,
    Projects,
    CaseStudies,
    LabProjects,
    Testimonials,
    // Assets
    Media,
    AssetLibraries,
    // Taxonomy
    Capabilities,
    Industries,
    Categories,
    // Newsletter
    Newsletters,
    Audiences,
    Subscribers,
    // System
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  endpoints: [...newsletterPublicEndpoints, ...askPublicEndpoints],
  plugins: [
    ...plugins,
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  globals: [Header, Footer],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [newsletterSendTask],
  },
})
