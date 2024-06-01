import React from "react";

export const H3 = ({
  children,
  center = false,
  classAdd = "",
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
  classAdd?: string;
}>) => {
  return (
    <h3
      className={`text-2xl text-bold ${classAdd} ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </h3>
  );
};
