import { PhoneSendError } from "@common/errors";
import { addOtpPhone } from "@utils/redis";
import twilio from "twilio";

export const ApiSendPhoneOtpCode = async ({
    phoneNumber,
    otpCode,
}: SendOtpCodeParams): Promise<string> => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        try {
            const client = twilio(accountSid, authToken);
            const result = await client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
                body: `${otpCode} is your verification code. Don't share your code with anyone.`
            });

            await addOtpPhone({ phoneNumber, code: otpCode });

            return result.sid;
        } catch (err) {
            throw new PhoneSendError();
        }

    } catch (err) {
        throw err;
    }
}

interface SendOtpCodeParams {
    phoneNumber: string,
    otpCode: string,
}

