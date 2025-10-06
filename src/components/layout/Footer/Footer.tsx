import React from "react";
import { Container } from "../../common/Container";
import { FaHandsHelping } from "react-icons/fa";
import { ResponsiveImage } from "../../common/ResponsiveImage";
import Link from "next/link";
import { Typography } from "../../common/ui/Typography";
import { SocialMedias } from "@/components/common/SocialMedia";
import { Api } from "@/lib/api";

/**
 * Composant pied de page avec liens sociaux et informations
 * @returns {Promise<JSX.Element>} Pied de page avec réseaux sociaux, contact et copyright
 */
export const Footer = async () => {
  const api = await Api();
  const links = await api.getLinksGlobal();
  return (
    <Container>
      <div className="my-6 py-6 flex flex-col items-center w-full border-t border-b-1 border-black">
        <SocialMedias links={links} />
        <Link href="/contact" className="py-6">
          Contact
        </Link>
        <Link
          className="mb-6 bg-[#D2270F] flex flex-row items-center gap-2 text-white px-3 py-1 mt-1 border border-[#D2270F] hover:bg-white hover:text-[#D2270F] hover:no-underline ease-in-out"
          href=""
        >
          <FaHandsHelping className="h-4 w-4" />
          Pour nous soutenir
        </Link>
        <Typography center>
          &copy; <Link href="/about">Sudfa</Link> - 2020 - Libre de droits
        </Typography>
        <a>
          <ResponsiveImage alt="" src="/monlogo.png" className="h-12 w-12" />
        </a>
      </div>
    </Container>
  );
};
