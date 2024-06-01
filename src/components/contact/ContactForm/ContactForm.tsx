import { Form, FormSchema } from "@/components/utils/Form";
import React from "react";
import { contactFormAction } from "./Contact.action";

const fields: FormSchema = [
  {
    type: "text",
    name: "name",
    placeholder: "Votre nom",
    required: true,
  },
  {
    type: "email",
    name: "email",
    placeholder: "Votre email",
    required: true,
  },
  {
    type: "textarea",
    name: "message",
    placeholder: "Votre message",
    required: true,
  },
];

export const ContactForm = () => {
  return (
    <Form
      formSchema={fields}
      submitText={"Envoyer"}
      submitForm={contactFormAction}
    />
  );
};
