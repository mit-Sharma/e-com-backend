import nodemailer from "nodemailer"
import dotenv from "dotenv"

const mailHelper=async (options)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_HOST,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message={
        from:'sharma@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(message);
}
export {mailHelper};