const nodeMailer = require('nodemailer');

const sendEmail = async (email,subject,messageToSend) => {
    console.log("sendEmail");
    console.log(email);
    try {
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: "donotreply.mymapstyler@gmail.com",
                pass: "laihvtnjhfpwhufv"
            }
        });

        const message = {
            from: 'My Map Styler <donotreply.mymapstyler@gmail.com>',
            to: email,
            subject: subject,
            text: messageToSend
        };

        const info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
    } catch (err) {
        console.log("err: " + err);
    }
}

module.exports = sendEmail;