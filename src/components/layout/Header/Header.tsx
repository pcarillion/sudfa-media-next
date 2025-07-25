import Link from "next/link";
import React from "react";
import { Container } from "../../common/Container";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { ResponsiveImage } from "../../common/ResponsiveImage";
import { Navbar } from "./Navbar";
import { mapCategoriesToNavItems } from "./Header.utils";
import { Api } from "@/lib/api";

export const Header = async () => {
  const api = await Api();
  const categories = await api.getCategories();
  const navItems = mapCategoriesToNavItems(categories);

  console.log(categories);

  return (
    <Container>
      <div className="flex flex-row justify-between items-end md:items-center h-[120px]">
        <div className="">
          <Link href="/">
            <ResponsiveImage
              src={"/mainlogo.png"}
              alt="sudfa logo"
              className="h-24 w-36 md:h-28 md:w-44"
            />
          </Link>
        </div>
        <div className="flex flex-col items-end md:items-center ">
          <h1 className="text-2xl">SUDFA MEDIA</h1>
          <p className="">Petit média franco-soudanais</p>
        </div>
        <div className="hidden md:flex flex-row h-full md:items-center">
          <div className="hidden md:flex md:flex-col md:items-center">
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
                className=""
                href="https://www.instagram.com/sudfa.media/"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram className="h-8 w-8" height="32px" width="32px" />
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
            <Link className="pt-4" href="/contact">
              Contact
            </Link>
          </div>
          <ResponsiveImage alt="" src="/illu.png" className="h-full w-20" />
        </div>
      </div>
      <Navbar navItems={navItems} />
    </Container>
  );
};
