import React from "react";

export const H4 = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <h4 className="text-xl text-bold">{children}</h4>;
};
