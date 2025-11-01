
export const isValidPhoneNumber = (phone: string): boolean => {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s-()]/g, "");

    // E.164 format: +[country code][subscriber number], up to 15 digits
    const regex = /^\+?[1-9]\d{6,14}$/;

    return regex.test(phone);
};

