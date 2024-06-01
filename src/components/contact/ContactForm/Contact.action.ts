"use server";

import { FormState } from "@/components/utils/Form";
import { sendEmail } from "@/lib/service/nodemailer";

export async function contactFormAction(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email");
  const name = formData.get("name");
  const text = formData.get("name");
  const honeypot = formData.get("hp");
  if (honeypot || !name || !text || !email)
    return {
      status: "error",
      message: "Merci de remplir tous les champs",
    };

  const res = await sendEmail(email, name, text);
  if (res) {
    return {
      status: "ok",
      message: "Merci pour votre message",
    };
  }
  return {
    status: "error",
    message: "Erreur lors de l'envoi du message",
  };
}
