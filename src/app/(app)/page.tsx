import { HomeContainer } from "@/containers/home";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return <HomeContainer />;
}
