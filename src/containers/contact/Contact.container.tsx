import { Container } from "@/components/common/Container";
import { H3 } from "@/components/common/ui/H3";
import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Api } from "@/lib/api";
import Link from "next/link";

/**
 * Conteneur de la page de contact
 * @returns {JSX.Element} Page de contact avec titre et formulaire
 */
export const ContactContainer = async () => {
  const api = await Api();
  const links = await api.getLinksGlobal();

  return (
    <Container>
      <H3 center>Contactez-nous</H3>
      {links?.contactEmail && (
        <div className="flex flex-col items-center w-full gap-10 mt-10 ">
          <div>A l&apos;adresse suivante :</div>
          <Link
            href={`mailto:${links?.contactEmail}`}
            className="px-12 py-4 border border-black"
          >
            {links?.contactEmail}
          </Link>
          <hr className="w-25" />
          <div>Ou bien :</div>
        </div>
      )}
      <ContactForm />
    </Container>
  );
};
