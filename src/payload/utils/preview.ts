type BuildPreviewURLArgs = {
  collection?: string;
  global?: string;
  slug?: string;
  id?: number | string;
  path: string;
};

export const buildPreviewURL = ({
  collection,
  global,
  slug,
  id,
  path,
}: BuildPreviewURLArgs): string => {
  const params = new URLSearchParams();

  params.set("path", path);
  params.set("previewSecret", process.env.PREVIEW_SECRET || "");

  if (collection) params.set("collection", collection);
  if (global) params.set("global", global);
  if (slug) params.set("slug", slug);
  if (id !== undefined && id !== null) params.set("id", String(id));

  return `/preview?${params.toString()}`;
};
