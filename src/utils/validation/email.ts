
export const isValidEmail = (
    email: string,
    allowedDomains: string[] = []
): boolean => {
    // Basic RFC 5322-style regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(email.toLowerCase())) {
        return false;
    }

    if (allowedDomains.length > 0) {
        const domain = email.split("@")[1].toLowerCase();
        return allowedDomains.includes(domain);
    }

    return true;
};

