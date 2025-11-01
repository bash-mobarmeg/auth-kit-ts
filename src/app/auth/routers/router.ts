import { Router } from "express";

import { AuthMiddleware } from "@app/auth/middlewares";

import {
    UpdatePasswordController,
    TFARegisterController,
    TFAValidateController,
    GoogleRegisterController,
    GoogleCallbackController,
    TFAUpdateController,
    SignupWithEmailController,
    SignupWithPhoneController,
    LoginWithEmailController,
    LoginWithPhoneController,
    CompleteAuthController,
    GetPhoneCodeController,
    GetEmailCodeController,
    PhoneCheckController,
    EmailCheckController,
} from "@app/auth/controllers";

// Initialize express router
const router = Router();

const auth = new AuthMiddleware();

router.post("/auth/login/email", LoginWithEmailController);
router.post("/auth/login/phone", LoginWithPhoneController);

router.post("/auth/signup/email", SignupWithEmailController);
router.post("/auth/signup/phone", SignupWithPhoneController);

router.post("/auth/signup/complete",
    auth.AuthenticatedUserOnly,
    CompleteAuthController
);

// Google authentication
router.get("/auth/google", GoogleRegisterController);
router.get("/auth/google/callback", GoogleCallbackController);

router.get("/auth/otp/phone", GetPhoneCodeController);
router.get("/auth/otp/email", GetEmailCodeController);

router.post("/auth/check/phone", PhoneCheckController);
router.post("/auth/check/email", EmailCheckController);

router.put("/auth/update/password",
    auth.AuthenticatedUserOnly,
    UpdatePasswordController
);

router.get("/auth/2fa/register",
    auth.AuthenticatedUserOnly,
    TFARegisterController
);

router.get("/auth/2fa/update",
    auth.AuthenticatedUserOnly,
    TFAUpdateController
);

router.post("/auth/2fa/validate",
    auth.AuthenticatedUserOnly,
    TFAValidateController
);

export default router;
