import nodemailer from "nodemailer";

export const sendEmail = async (
  emailFrom: FormDataEntryValue,
  name: FormDataEntryValue,
  message: FormDataEntryValue
): Promise<boolean> => {
  let transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  // vérifier si le serveur fonctionne
  //   transporter.verify(function (error, success) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //     }
  //   });

  //   Définissez les options de l'email
  let mailOptions = {
    from: process.env.NODEMAILER_EMAIL, // Adresse de l'expéditeur
    to: process.env.NODEMAILER_EMAIL, // Adresse du destinataire
    subject: "Contact sur Sudfa", // Sujet de l'email
    text: `Nouveau message de ${name} \n Email: ${emailFrom} \n Message: ${message}`, // Corps de l'email
  };

  // Envoyez l'email avec l'objet transport défini
  try {
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
    return true;
  } catch (error) {
    console.error("Failed to send email: ", error);
    return false;
  }
};
