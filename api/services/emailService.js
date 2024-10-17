// services/emailService.js
const nodemailer = require("nodemailer");
require('dotenv').config(); // To load environment variables from .env file
let EMAIL_USER=`aditya.khedekar@somaiya.edu`;
let EMAIL_PASS=`jmfn eoxj wmyq gvox`;
// Email service setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER, // Use environment variable for email
    pass: EMAIL_PASS  // Use environment variable for password
  }
});


const sendContactEmail = async ({ name, email, phone, description }) => {
  const mailOptions = {
    from: email, // Sender's email
    to: 'sahil.kumar@somaiya.edu', // Recipient's email
    subject: `New message from ${name}`, // Subject of the email
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDescription: ${description}`, // Body of the email
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, response: info.response }; // Include the response in the return
  } catch (error) {
    console.log("Error sending email: ", error);
    return { success: false, response: error.message }; // Include error message in the response
  }
};

// const sendContactEmail = async ({ name, email, phone, description }) => {
//   const mailOptions = {
//     from: email, // Sender's email
//     to: 'sahil.kumar@somaiya.edu', // Recipient's email
//     subject: `New message from ${name}`, // Subject of the email
//     text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDescription: ${description}`, // Body of the email
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent: " + info.response);
//     return { success: true };
//   } catch (error) {
//     console.log("Error sending email: ", error);
//     throw new Error("Email could not be sent");
//   }
// };


module.exports = { sendContactEmail };
