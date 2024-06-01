"use client";

import React, { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/common/Container";

export const Pagination = ({
  shouldHideButton,
}: {
  shouldHideButton: boolean;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const nextPage = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const currentPage = Number(params.get("p"));
    let pageToQuery = "1";
    if (currentPage) {
      pageToQuery = (currentPage + 1).toString();
    }
    params.set("p", pageToQuery);
    replace(`${pathname}?${params.toString()}`);
  }, [replace, pathname, searchParams]);
  useEffect(() => {
    const currentPage = searchParams.get("p");
    if (!currentPage) {
      nextPage();
    }
    if (Number(currentPage) > 1 && window) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [searchParams, nextPage]);
  if (shouldHideButton) return null;
  return (
    <Container>
      <button
        className="text-xl mx-auto block my-6 border w-12 h-12 border-black hover:opacity-70 hover:boder-slate-700 rounded-full"
        onClick={() => nextPage()}
      >
        +
      </button>
    </Container>
  );
};
