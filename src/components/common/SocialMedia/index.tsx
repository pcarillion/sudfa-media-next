import { ResponsiveImage } from "@/components/common/ResponsiveImage";
import { Link } from "@/payload-types";
import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

/**
 * Composant des liens vers les réseaux sociaux
 * @param {Object} props - Les propriétés du composant
 * @param {Link} props.links - Configuration des liens depuis Payload
 * @returns {JSX.Element} Liens vers Facebook, Instagram et Mediapart
 */
export const SocialMedias = ({ links }: { links: Link }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-x-4">
      <a
        className="hover:text-[#D2270F] transition-colors duration-200"
        href={
          links.facebookUrl ||
          "https://www.facebook.com/Sudfa-%D8%B5%D8%AF%D9%81%D8%A9-2268469196753720/?ref=page_internal"
        }
        target="_blank"
        rel="noreferrer"
      >
        <FaFacebook className="h-7 w-7" height="32px" width="32px" />
      </a>
      <a
        className="hover:text-[#D2270F] transition-colors duration-200"
        href={links.instagramUrl || "https://www.instagram.com/sudfa.media/"}
        target="_blank"
        rel="noreferrer"
      >
        <FaInstagram className="h-7 w-7" height="32px" width="32px" />
      </a>
      <a
        className="group transition-all duration-200"
        href={links.mediapartUrl || "https://blogs.mediapart.fr/sudfa"}
        target="_blank"
        rel="noreferrer"
      >
        <ResponsiveImage
          alt="mediapart"
          src="/mediapart.png"
          className="h-7 w-9 group-hover:hidden"
        />
        <ResponsiveImage
          alt="mediapart"
          src="/mediapartrouge.png"
          className="h-7 w-9 hidden group-hover:block"
        />
      </a>
    </div>
  );
};
