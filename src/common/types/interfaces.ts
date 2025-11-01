
export interface TFASecret {
    hex: string,
    ascii: string,
    base64: string,
    otpauth_url: string | undefined,
}

export interface FindByFieldParams {
    field: string,
    value: any
}

