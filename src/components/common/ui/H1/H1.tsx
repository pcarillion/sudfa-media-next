import React from "react";

export const H1 = ({
  children,
  center = false,
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
}>) => {
  return (
    <h1
      className={`text-2xl italic my-2.5 md:my-5 md:text-5xl ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </h1>
  );
};
