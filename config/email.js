const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service:"gmail",
  host:"smtp.ethereal.email",
  secure:false,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});




// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error with email transporter:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

module.exports = transporter;




// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   // secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });



// // Verify connection configuration
// transporter.verify(function(error, success) {
//   if (error) {
//     console.error('Error with email transporter:', error);
//   } else {
//     console.log('Email transporter is ready to send messages');
//   }
// });

// module.exports = transporter;
