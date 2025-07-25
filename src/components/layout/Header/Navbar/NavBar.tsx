"use client";

import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { NavItem } from "./NavBar.types";
import { usePathname } from "next/navigation";

interface NavBarProps {
  navItems: NavItem[];
}

export const Navbar = ({ navItems }: NavBarProps) => {
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
        <Link
          href={`/`}
          className={`${
            pathName === "/" ? "font-bold" : ""
          }  hover:no-underline hover:opacity-70`}
        >
          <li className="px-4 m-2 hover:no-underline">Accueil</li>
        </Link>
        {navItems.map(({ label, id }) => (
          <Link
            href={`/category/${id}`}
            key={id}
            className={`${
              pathName === `/category/${id}` ? "font-bold" : ""
            } hover:no-underline hover:opacity-70`}
          >
            <li key={id} className="px-4 m-2 hover:no-underline">
              {label}
            </li>
          </Link>
        ))}
        <Link
          href={`/auteurs`}
          className={`${
            pathName === "/auteurs" ? "font-bold" : ""
          } hover:no-underline hover:opacity-70`}
        >
          <li className="px-4 m-2 hover:no-underline">L&lsquo;Equipe</li>
        </Link>
        <Link
          href={`/a-propos`}
          className={`${
            pathName === "/a-propos" ? "font-bold" : ""
          } hover:no-underline hover:opacity-70`}
        >
          <li className="px-4 m-2 hover:no-underline">A propos</li>
        </Link>
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
        <ul>
          <Link href={`/accueil`}>
            <li className="p-4">Accueil</li>
          </Link>
          {/* Mobile Navigation Items */}
          {navItems.map(({ label, id }) => (
            <Link href={`/category/${id}`} key={id}>
              <li key={id} className="p-4">
                {label}
              </li>
            </Link>
          ))}
          <Link href={`/auteurs`}>
            <li className="p-4">Les Auteurs</li>
          </Link>
          <Link href={`/a-propos`}>
            <li className="p-4">A propos</li>
          </Link>
        </ul>
      </div>
    </nav>
  );
};
