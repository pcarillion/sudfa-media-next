import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  UploadFeature,
  LinkFeature,
  BlocksFeature,
} from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Import collections
import { Users } from "./payload/collections/Users";
import { Categories } from "./payload/collections/Categories";
import { Authors } from "./payload/collections/Authors";
import { Articles } from "./payload/collections/Articles";
import { MediaBackUp } from "./payload/collections/MediaBackup";

// Import globals
import { Une } from "./payload/globals/Une";

import { cloudinaryStorage } from "payload-storage-cloudinary";
import { s3Storage } from "@payloadcms/storage-s3";
import { Media } from "@/payload/collections/Media";
import { Links } from "@/payload/globals/Links";
import { APropos } from "@/payload/globals/APropos";
import { VideoBlock } from "@/payload/blocks/VideoBlock";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Categories, Authors, Articles, Media, MediaBackUp],
  globals: [Une, Links, APropos],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: "alt",
                type: "text",
                label: "Texte alternatif",
              },
            ],
          },
        },
      }),
      LinkFeature({
        fields: [
          {
            name: "rel",
            label: "Relation",
            type: "select",
            hasMany: true,
            options: ["noopener", "noreferrer", "nofollow"],
            admin: {
              description: "Attributs de relation pour le lien",
            },
          },
        ],
      }),
      BlocksFeature({
        blocks: [VideoBlock],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    push: true, // Enabled to recreate media table with correct schema
    // logger: process.env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [
    cloudinaryStorage({
      cloudConfig: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
      collections: {
        media_cloudinary_backup: true, // Simple config - just works!
      },
    }),
    s3Storage({
      collections: {
        media: { prefix: "payload" },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY ?? "",
          secretAccessKey: process.env.S3_SECRET_KEY ?? "",
        },
        region: "eu-north-1",
      },
    }),
  ],
});
