const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_MAILER_ID,
    pass: process.env.GOOGLE_MAILER_PASSWORD,
  },
});

const sendMail = async function main(receiversAddress,subject,text) {
  const info = await transporter.sendMail({
    from: '"DailyDiary" <hellotestuser989@gmail.com>', // sender address
    to: receiversAddress, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
  });
}

module.exports = sendMail;
