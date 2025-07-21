import { AProposContainer } from "@/containers/a-propos";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function APropos() {
  return <AProposContainer />;
}
