import React from "react";

export const Container = ({
  children,
  addClass = "",
}: Readonly<{
  children: React.ReactNode;
  addClass?: string;
}>) => {
  return (
    <div className={`container-xl mx-auto px-3 md:px-8 ${addClass}`}>
      {children}
    </div>
  );
};
