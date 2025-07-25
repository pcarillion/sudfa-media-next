import { ArticleContainer } from "@/containers/article";
import { Api } from "@/lib/api";
import { Media } from "@/payload-types";
import { lexicalToPlainText } from "@/utils/lexicalToPlainText";
import { Metadata } from "next";

// Force dynamic rendering - no static generation
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const api = await Api();
  const article = await api.getArticleBySlug(decodeURIComponent(slug));

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
  return <ArticleContainer slug={slug} />;
}
