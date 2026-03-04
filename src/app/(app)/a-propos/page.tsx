import { AProposContainer } from "@/containers/a-propos";

export const revalidate = 300;

export default async function APropos() {
  return <AProposContainer />;
}
