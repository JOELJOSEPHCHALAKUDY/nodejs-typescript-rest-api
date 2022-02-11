import express from "express";
import Router from "express-promise-router";
import passport from "passport";

import { passportConfig } from "../../passport/passport";

const router = Router();

import accountController from "../../contollers/account.controller";
import { validateBody, schemas } from "../../helpers/route.helpers";

const passportLocalOAuth = passport.authenticate("local", { session: false });
const passportJwtOAuth = passport.authenticate("jwt", { session: false });

router
  .route("/signup")
  .post(validateBody(schemas.signupSchema), accountController.signUp);

router
  .route("/signin")
  .post(
    validateBody(schemas.authSchema),
    passportLocalOAuth,
    accountController.signIn
  );

router
  .route("/verify-account")
  .post(validateBody(schemas.verifyOtpSchema), accountController.verifyAccount);

router
  .route("/verify-otp")
  .post(validateBody(schemas.verifyOtpSchema), accountController.verifyOtp);

router
  .route("/resend-otp")
  .post(validateBody(schemas.emailSchema), accountController.resendOTP);

router
  .route("/recover")
  .post(validateBody(schemas.emailSchema), accountController.recoverAccount);

router
  .route("/password-reset")
  .post(
    validateBody(schemas.passwordResetSchema),
    accountController.reSetPassword
  );

router
  .route("/set-password")
  .post(validateBody(schemas.passwordSetSchema), accountController.setPassword);

export default router;
