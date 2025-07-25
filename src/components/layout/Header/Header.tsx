import Link from "next/link";
import React from "react";
import { Container } from "../../common/Container";
import { FaHandsHelping } from "react-icons/fa";
import { ResponsiveImage } from "../../common/ResponsiveImage";
import { Navbar } from "./Navbar";
import { mapCategoriesToNavItems } from "./Header.utils";
import { Api } from "@/lib/api";
import { SocialMedias } from "@/components/common/SocialMedia";

export const Header = async () => {
  const api = await Api();
  const categories = await api.getCategories();
  const navItems = mapCategoriesToNavItems(categories);
  const links = await api.getLinksGlobal();

  return (
    <>
      <Container>
        <div className="flex flex-row items-end md:items-center h-[120px]">
          <div className="flex-1 flex justify-start">
            <Link href="/">
              <ResponsiveImage
                src={"/mainlogo.png"}
                alt="sudfa logo"
                className="h-24 w-36 md:h-28 md:w-44"
              />
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-2xl">SUDFA MEDIA</h1>
            <p className="">Petit média franco-soudanais</p>
          </div>
          <div className="flex-1 hidden md:flex justify-end h-full">
            <div className="flex flex-row h-full items-center">
              <div className="flex flex-col items-center">
                <SocialMedias links={links} />
                <Link className="pt-4" href="/contact">
                  Contact
                </Link>
                <Link
                  className="bg-[#D2270F] flex flex-row items-center gap-2 text-white px-3 py-1 mt-1 border border-[#D2270F] hover:bg-white hover:text-[#D2270F] hover:no-underline ease-in-out"
                  href={links.cagnotteUrl || ""}
                >
                  <FaHandsHelping className="h-4 w-4" />
                  Pour nous soutenir
                </Link>
              </div>
              <ResponsiveImage alt="" src="/illu.png" className="h-full w-20" />
            </div>
          </div>
        </div>
      </Container>
      <div className="sticky top-0 z-50 bg-white md:shadow-sm">
        <Container>
          <Navbar navItems={navItems} links={links} />
        </Container>
      </div>
    </>
  );
};
