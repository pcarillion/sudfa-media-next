import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import React from "react";

export default function RootTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
