
export interface SignupEmailBody {
    username: string,
    email: string,
    code: string,
    password: string,
}

export interface SignupPhoneBody {
    username: string,
    phoneNumber: string,
    code: string,
    password: string,
}

export interface PhoneNumberCheckBody {
    phoneNumber: string,
}

export interface EmailCheckBody {
    email: string,
}

