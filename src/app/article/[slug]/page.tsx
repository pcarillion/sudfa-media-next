import { ArticleContainer } from "@/containers/article";
import { Api } from "@/lib/api";
import { Metadata } from "next";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const slug = params.slug;
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
  return <ArticleContainer slug={params.slug} />;
}
