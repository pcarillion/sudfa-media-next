import { ContactContainer } from "@/containers/contact";
import React from "react";

export const revalidate = 300;

export default async function Contact() {
  return <ContactContainer />;
}
