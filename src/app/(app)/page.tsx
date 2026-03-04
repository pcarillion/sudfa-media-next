import { HomeContainer } from "@/containers/home";

export const revalidate = 300;

export default async function Home() {
  return <HomeContainer />;
}
