import React from "react";

export const Typography = ({
  children,
  classAdd,
  center = false,
  small = false,
}: Readonly<{
  children: React.ReactNode;
  center?: boolean;
  classAdd?: string;
  small?: boolean;
}>) => {
  let className = "w-full ";
  if (classAdd) className += classAdd;
  if (center) className += " text-center";
  className += small ? " text-base" : " text-lg ";
  return <div className={className}>{children}</div>;
};
