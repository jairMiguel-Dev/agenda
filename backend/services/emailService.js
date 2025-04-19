// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro serviço de e-mail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNotificationEmail = (recipients, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients,
    subject,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('Erro no envio de e-mail:', error);
    else console.log('E-mail enviado:', info.response);
  });
};

module.exports = sendNotificationEmail;