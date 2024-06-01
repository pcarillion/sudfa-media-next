import React from "react";
import { Container } from "../../common/Container";
import { FaFacebook } from "react-icons/fa";
import { ResponsiveImage } from "../../common/ResponsiveImage";
import Link from "next/link";
import { Typography } from "../../common/ui/Typography";

export const Footer = () => {
  return (
    <Container>
      <div className="my-6 py-6 flex flex-col items-center w-full border-t border-b-1 border-black">
        <div className="flex flex-row justify-between items-center gap-x-4">
          <a
            className=""
            href="https://www.facebook.com/Sudfa-%D8%B5%D8%AF%D9%81%D8%A9-2268469196753720/?ref=page_internal"
            target="_blank"
            rel="noreferrer"
          >
            <FaFacebook className="h-8 w-8" height="32px" width="32px" />
          </a>
          <a
            href="https://blogs.mediapart.fr/sudfa"
            target="_blank"
            rel="noreferrer"
          >
            <ResponsiveImage
              alt="mediapart"
              src="/mediapart.png"
              className="h-8 w-12"
            />
          </a>
        </div>
        <Link href="/contact" className="py-6">
          Contact
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
