import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

// Collections
import { Users } from "../../payload/collections/Users";
import { Categories } from "../../payload/collections/Categories";
import { Authors } from "../../payload/collections/Authors";
import { Articles } from "../../payload/collections/Articles";
import { Presentations } from "../../payload/collections/Presentations";
import { MediaBackUp } from "../../payload/collections/MediaBackup";
import { Media } from "../../payload/collections/Media";
import { s3Storage } from "@payloadcms/storage-s3";
import { Une } from "../../payload/globals/Une";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Crée une configuration Payload pour les scripts de migration
 * @param isProduction - Si true, utilise la base de données de production
 * @param enablePush - Si true, active le push automatique de schéma
 */
export async function createPayloadConfig(
  isProduction = false,
  enablePush = false
) {
  const dbUrl = isProduction
    ? process.env.NETLIFY_DATABASE_URL
    : process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      `Variable d'environnement manquante: ${isProduction ? "NETLIFY_DATABASE_URL" : "DATABASE_URL"}`
    );
  }

  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("Variable d'environnement manquante: PAYLOAD_SECRET");
  }

  // Dynamic import for cloudinary storage
  const { cloudinaryStorage } = await import("payload-storage-cloudinary");

  return buildConfig({
    admin: {
      user: "users",
      importMap: {
        baseDir: path.resolve(__dirname),
      },
    },
    collections: [
      Users,
      Categories,
      Authors,
      Articles,
      Presentations,
      Media,
      MediaBackUp,
    ],
    globals: [Une],
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || "",
    typescript: {
      outputFile: path.resolve(__dirname, "payload-types.ts"),
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
          media_cloudinary_backup: true,
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
}

/**
 * Valide les variables d'environnement nécessaires
 * @param isProduction - Si true, valide les variables de production
 * @param useS3 - Si true, valide les variables S3 au lieu de Cloudinary
 */
export function validateEnvironmentVariables(
  isProduction = false,
  useS3 = false
) {
  const required = ["PAYLOAD_SECRET"];

  if (isProduction) {
    required.push("NETLIFY_DATABASE_URL");
  } else {
    required.push("DATABASE_URL");
  }

  if (useS3) {
    required.push("S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY");
  } else {
    required.push(
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET"
    );
  }

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(", ")}`
    );
  }

  return true;
}
