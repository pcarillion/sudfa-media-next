"use client";

import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { MenuItem } from "./NavBar.types";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { FaHandsHelping } from "react-icons/fa";
import { Link as LinkType } from "@/payload-types";

interface NavBarProps {
  navItems: MenuItem[];
  links: LinkType;
}

export const Navbar = ({ navItems, links }: NavBarProps) => {
  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };

  const pathName = usePathname();

  return (
    <nav className="w-full my-4 py-2 border border-b-2 border-x-slate-300 border-slate-700">
      <ul className="hidden md:flex flex-wrap justify-center">
        {navItems.map((item) => {
          const isActive = pathName === item.href;
          const itemLabel =
            item.type === "recherche" ? (
              <Search className="h-5 w-5" />
            ) : (
              item.label
            );
          const key = "id" in item ? item.id : item.href;
          return (
            <Link
              href={item.href}
              key={`${item.type}-${key}`}
              className={`${isActive ? "font-bold" : ""} hover:no-underline hover:opacity-70`}
            >
              <li className="px-4 m-2 hover:no-underline h-full">
                {itemLabel}
              </li>
            </Link>
          );
        })}
      </ul>
      {/* Mobile Navigation Icon */}
      <div onClick={handleNav} className="block md:hidden mx-auto w-min">
        <AiOutlineMenu size={20} />
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={
          nav
            ? "bg-white pt-4 fixed md:hidden left-0 top-0 w-full h-full ease-in-out duration-500 z-50"
            : "bg-white ease-in-out w-full duration-500 fixed top-0 bottom-0 left-[-100%]"
        }
      >
        <div
          onClick={handleNav}
          className="block md:hidden absolute right-0 top-0 w-min m-3"
        >
          <AiOutlineClose size={20} />
        </div>
        <ul className="h-full flex flex-col">
          {/* Mobile Navigation Items */}
          {navItems.map((item) => {
            const itemLabel =
              item.type === "recherche" ? (
                <Search className="h-5 w-5" />
              ) : (
                item.label
              );
            const key = "id" in item ? item.id : item.href;
            return (
              <Link href={item.href} key={`${item.type}-${key}`}>
                <li className="p-3">{itemLabel}</li>
              </Link>
            );
          })}
          <li className="border-t p-3 flex flex-row gap-4 items-center justify-between">
            <Link
              className="bg-[#D2270F] flex flex-row items-center gap-2 text-white px-3 py-1 mt-1 border border-[#D2270F] hover:bg-white hover:text-[#D2270F] hover:no-underline ease-in-out"
              href={links.cagnotteUrl || ""}
            >
              <FaHandsHelping className="h-4 w-4" />
              Pour nous soutenir
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
