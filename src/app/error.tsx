"use client"; // Error components must be Client Components

import { Container } from "@/components/common/Container";
import { useEffect } from "react";
import { H3 } from "@/components/common/ui/H3";
import { Typography } from "@/components/common/ui/Typography";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <H3 center>Une erreur est survenue</H3>
      <Typography center>
        Une erreur sur le serveur est survenue ou bien cette page n&apos;existe
        pas...
      </Typography>
      <button
        onClick={() => reset()}
        className="block mx-auto w-96 my-6 p-2 border border-slate-500 hover:"
      >
        Essayer de nouveau
      </button>
    </Container>
  );
}
