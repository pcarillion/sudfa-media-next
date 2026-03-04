import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.update({
    collection: "articles",
    where: {},
    data: {
      _status: "published",
    } as never,
    overrideAccess: true,
  });
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.update({
    collection: "articles",
    where: {},
    data: {},
    overrideAccess: true,
  });
}
