const transporter = require('../config/email');

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Meta Fx" ${process.env.EMAIL_USER}`, // Sender address
    from: `"Meta Fx" ${process.env.EMAIL_USER}`, // Sender address
    to , // List of recipients
    subject:"Verification Code", // Subject line
    text 
    // html: "<b>Hello world?</b>" // Optional: HTML body
  };

  

  // const mailOptions = {
  //   from: `"Aniket Kalawat" <${process.env.EMAIL_USER}>`, // Sender address
  //   to :  process.env.EMAIL_USER , // List of recipients
  //   subject : "Trading Website", // Subject line
  //   text // Plain text body
  //   // html: "<b>Hello world?</b>" // Optional: HTML body
  // };
    
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(400).send('Email could not be sent');
  }
};

module.exports = sendEmail;



// const transporter = require('../config/email');

// // const sendEmail = async (to, subject, text) => {
// //   const mailOptions = {
// //     from: `"Aniket Kalawat" <${process.env.EMAIL_USER}>`, // Sender address
// //     to, // List of recipients
// //     subject, // Subject line
// //     text // Plain text body
// //     // html: "<b>Hello world?</b>" // Optional: HTML body
// //   };

//     const sendEmail = async (to, subject, text) => {
//     const mailOptions = {
//       from: `"Aniket Kalawat" <aniketkalawat8@gmail.com>`, // Sender address
//       to : "aniketkalawat88@gmail.com", // List of recipients
//       subject:"Hello ", // Subject line
//       text:"how are you" // Plain text body
//       // html: "<b>Hello world?</b>" // Optional: HTML body
//     };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw new Error('Email could not be sent');
//   }
// };

// module.exports = sendEmail;
