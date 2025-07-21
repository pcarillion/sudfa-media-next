import { ContactContainer } from "@/containers/contact";
import React from "react";

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Contact() {
  return <ContactContainer />;
}
