// backend/config/emailConfig.js

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: 'smtp.google.com', // Remplacez par votre hôte SMTP
  port: 465, // Remplacez par votre port SMTP
  auth: {
    user: "brahimboutagjat@gmail.com", // Votre nom d'utilisateur SMTP
    pass: "lkzl odzd jyba ygqu", // Votre mot de passe SMTP
  },
});
