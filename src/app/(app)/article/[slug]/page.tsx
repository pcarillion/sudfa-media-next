import { ArticleContainer } from "@/containers/article";
import { Api } from "@/lib/api";
import { Media } from "@/payload-types";
import { lexicalToPlainText } from "@/utils/lexicalToPlainText";
import { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";

export const revalidate = 300;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const api = await Api();
  const article = await api.getArticleBySlug(decodeURIComponent(slug), {
    draft: isEnabled,
  });

  if (!article) {
    return {
      title: "Article non trouvé - Sudfa média",
      description: "Article non trouvé",
    };
  }

  return {
    title: `Sudfa média - ${article.titre}`,
    description: lexicalToPlainText(article.presentation),
    openGraph: {
      images: article.photoPrincipale
        ? [(article.photoPrincipale as Media).url!]
        : [],
    },
  };
}

export default async function Article({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();

  const exitPreviewHref = `/preview/exit?${new URLSearchParams({
    path: `/article/${slug}`,
  }).toString()}`;

  return (
    <>
      {isEnabled && (
        <Link
          href={exitPreviewHref}
          className="fixed bottom-4 right-4 z-[100] border border-black bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
        >
          Sortir du mode aperçu
        </Link>
      )}
      <ArticleContainer slug={slug} draft={isEnabled} />
    </>
  );
}
