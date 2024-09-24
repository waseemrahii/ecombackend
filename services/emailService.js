import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to another service like SendGrid, Mailgun, etc.
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASS_KEY,
        },
    })

    // 2. Define the email options
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: options.email,
        subject: options.subject,
        html: options.html,
    }

    // 3. Actually send the email
    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(`Error:`, error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}

export default sendEmail
