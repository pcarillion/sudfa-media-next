"use client";

import { Container } from "@/components/common/Container";
import { H3 } from "@/components/common/ui/H3";
import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";

export const ContactContainer = ({}) => {
  return (
    <Container>
      <H3 center>Contactez-nous</H3>
      <ContactForm />
    </Container>
  );
};
