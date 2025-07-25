import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticlesList } from "@/components/articles/ArticlesList";
import { Container } from "@/components/common/Container";
import { H3 } from "@/components/common/ui/H3";
import LexicalRenderer from "@/components/utils/LexicalRenderer/LexicalRenderer";
import { Api } from "@/lib/api";
import React from "react";

export const HomeContainer = async () => {
  const api = await Api();
  let articles = await api.getHomeArticles();
  let politicArticles = await api.getArticlesByCategory("Politique", 3, true);
  let cultureArticles = await api.getArticlesByCategory("Culture", 2, true);

  return (
    <Container>
      <section className="md:grid md:grid-cols-12">
        <div className="md:col-span-8">
          {/* main section three last articles + culture -- span 14 */}
          <H3 classAdd="p-3">A la Une</H3>
          <div className="md:grid md:grid-cols-8 h-full">
            {/* three last articles */}
            <div className="md:col-span-3 h-full">
              {/* main article in mobile */}
              {articles.length > 0 && (
                <div className="md:hidden">
                  <ArticleCard
                    article={articles[0]}
                    hasPicture
                    hasDescription
                  />
                </div>
              )}
              {/* left articles: 4 -- span 5 */}
              {articles.map((article, i) => {
                if (i < 1 || i > 6 || articles.length < i - 1) return null;
                console.log(article.id);
                return <ArticleCard key={article.id} article={article} />;
              })}
            </div>
            {/* main article: 1 -- span 9 */}
            {articles.length > 0 && (
              <div className="md:col-span-5">
                <ArticleCard article={articles[0]} hasPicture hasDescription />
              </div>
            )}
          </div>
          <div>{/* culture: 2 articles */}</div>
        </div>
        <div className="md:col-span-4 md:border-l">
          {/* right hand section with politics + presentation -- span 6 */}
          {politicArticles.length > 0 && (
            <>
              <H3 classAdd="p-3">Politique</H3>
              <ArticleCard article={politicArticles[0]} hasPicture />
              <div className="md:grid md:grid-cols-2">
                {/* left articles: 2 -- span 5 */}
                <ArticleCard article={politicArticles[1]} hasPicture />
                <ArticleCard article={politicArticles[2]} hasPicture />
              </div>
            </>
          )}
        </div>
        {cultureArticles.length > 0 && (
          <>
            <div className="md:col-span-8 md:border-t">
              <H3 classAdd="p-3">Culture</H3>
              <div className="md:grid md:grid-cols-8 h-full">
                {cultureArticles.map(article => {
                  return (
                    <div className="md:col-span-4" key={article.id}>
                      <ArticleCard
                        article={article}
                        hasPicture
                        hasDescription
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {/* {presentation && ( */}
        <div className="md:col-span-4 md:border-l">
          {/* <H3 classAdd="p-3">{presentation.titre}</H3> */}
          <div className="px-3">
            {/* <LexicalRenderer small content={presentation.shortVersion_html} /> */}
          </div>
        </div>
        {/* )} */}
      </section>
      {/* {articles.length > 5 && (
        <section className="p-3 mt-12">
          <H3 center>Articles</H3>
          <ArticlesList articles={articles.slice(5)} />
        </section>
      )} */}
    </Container>
  );
};
