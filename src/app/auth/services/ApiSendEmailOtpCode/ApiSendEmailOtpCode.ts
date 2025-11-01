import { EmailNotAcceptedError, EmailSendError } from "@common/errors";
import { addOtpEmail } from "@utils/redis";
import nodemailer from "nodemailer";

export const ApiSendEmailOtpCode = async ({
    email,
    otpCode,
}: SendOtpCodeParams): Promise<string> => {
    try {

        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        // Send emails to users
        let result = await transporter.sendMail({
            from: 'www.bash-mobarmeg.github.io/portfolio - Mohammed Ghaly',
            to: email,
            subject: "Verification code",
            html: EMAIL_TEMPLATE.replace("{{code}}", otpCode),
        });

        if (result.accepted) {
            throw new EmailNotAcceptedError();
        }

        await addOtpEmail({ email, code: otpCode });

        return result.messageId;
    } catch (err) {
        throw new EmailSendError();
    }
}

const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Confirm Your Account</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background-color: #f9f9f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #e0e0e0;
            overflow: hidden;
            padding: 40px;
        }

        .logo {
            display: block;
            margin: 0 auto 30px;
            width: 48px;
            height: 48px;
            background: url('https://dummyimage.com/48x48/181818/fff.png&text=%E2%9C%94') center/cover no-repeat;
            border-radius: 50%;
        }

        h1 {
            text-align: center;
            font-size: 24px;
            color: #181818;
            margin: 0 0 20px;
        }

        p {
            text-align: center;
            font-size: 16px;
            color: #555555;
            margin: 0 0 30px;
        }

        .code {
            display: block;
            width: fit-content;
            margin: 0 auto 30px;
            padding: 14px 28px;
            background-color: #181818;
            color: #ffffff;
            font-size: 17px;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 8px;
        }

        .footer {
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            text-align: center;
            font-size: 13px;
            color: #999999;
        }

        .footer a {
            color: #999999;
            text-decoration: none;
            margin-left: 10px;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="logo"></div>
        <h1>Confirm your account</h1>
        <p>Click the button below to confirm your email address. This link is valid for 10 minites.</p>
        <span class="code">{{code}}</span>
        <div class="footer">&copy; 2025 company. All rights reserved.</div>
    </div>
</body>
</html>
`;

interface SendOtpCodeParams {
    email: string,
    otpCode: string,
}

