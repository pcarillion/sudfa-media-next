import { ArticleContainer } from "@/containers/article";
import { Api } from "@/lib/api";
import { Metadata } from "next";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
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

  return {
    title: `Sudfa média - ${article.titre}`,
    description: article.presentation,
    openGraph: {
      images: [article.photoPrincipale],
    },
  };
}

export default async function Article({ params }: ArticlePageProps) {
  const { slug } = await params;
  return <ArticleContainer slug={slug} />;
}
