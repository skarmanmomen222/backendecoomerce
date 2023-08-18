const nodemailer = require("nodemailer");
exports.sendEmail = async (options) => {

    // SMPT_EMAIL SMPT_PASS SMPT_SERVICE SMPT_HOST

    const transporter =  await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_EMAIL,
            pass: process.env.SMPT_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.SMPT_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

   const info = await transporter.sendMail(mailOptions);
  
}