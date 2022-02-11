import { DocumentDefinition } from "mongoose";
import JWT from "jsonwebtoken";
import config from "config";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

import Account from "../models/account.model";
import Subscription from "../models/subscription.model";

import { IAccount } from "../interfaces/account";

const signToken = (
  user: DocumentDefinition<IAccount>,
  remember_me: boolean
) => {
  // generate token
  return JWT.sign(
    {
      iss: "nodeapp",
      sub: user._id,
      iat: Math.floor(new Date().getTime() / 1000), // current time ,
      exp: Math.floor(
        new Date().setDate(new Date().getDate() + (remember_me ? 3 : 1)) / 1000
      ), // for one hour Math.floor(Date.now() / 1000) + (60 * 60), for current time + 1 day use Math.floor(new Date().setDate(new Date().getDate() + 1) / 1000)
    },
    config.get("JWT_SECRET")
  );
};

const otpExpireTime = () => {
  let otp_expired_at = new Date();
  otp_expired_at.setMinutes(otp_expired_at.getMinutes() + 10);
  return otp_expired_at;
};

const getTimestamp = (date: any): Number => {
  return Math.floor(date / 1000);
};

export default {
  signUp: async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = req.value.body;

    // check if an account with same email exisit already
    const foundAccount = await Account.findOne({ email, active: true });
    if (foundAccount) {
      return res.status(403).json({ error: "The email is already registered" });
    }

    // check if an account with same username exisit already
    const foundUsername = await Account.findOne({ username });
    if (foundUsername) {
      return res.status(403).json({ error: "The username is already in use" });
    }

    // genrate
    let otp = Math.floor(10000 + Math.random() * 90000);
    const otp_expired_at = otpExpireTime();

    const deactiveAccount = await Account.findOne({ email, active: false });
    if (deactiveAccount) {
      deactiveAccount.otp = otp;
      deactiveAccount.otp_expired_at = otp_expired_at;
      await deactiveAccount.save();

      // send confirmation email
      //await mailService.sendOtpEmail(deactiveAccount.email, otp, '', 'OTP', 'put your sendgrid template id here');

      // resopnd with token
      return res.status(403).json({
        message:
          "Account not activated, please complete verifiction with otp send to your email",
      });
    }

    // create new user if does not exists
    const newAccount = new Account({ email, username, otp, otp_expired_at });

    // generate salt
    const salt = await bcrypt.genSalt(10);

    // generate the password hash (salt + password)
    const passwordHash = await bcrypt.hash(password, salt);

    // assign  hashed  version  over original , plain text password
    newAccount.password = passwordHash;
    // newAccount.active = true;
    await newAccount.save();

    // send confirmation email
    //await mailService.sendOtpEmail(newAccount.email, otp, '', ' OTP', 'put your sendgrid template id here');

    // resopnd with token
    res.status(200).json({
      message: " Email with One Time Password has be send to the " + email,
    });
  },

  signIn: async (req: Request, res: Response, next: NextFunction) => {
    //generate token by passing req.user which here gives loggedin account
    const token = await signToken(req.user, req.body.remember_me);

    let is_pro = false;
    let subscriptionData = await Subscription.findOne({ _id: req.user._id });
    if (subscriptionData && subscriptionData.active == true) {
      is_pro = true;
    }

    res.status(200).json({
      id: req.user._id,
      token: token,
      email: req.user.email,
      username: req.user.username,
      avatar: req.user.avatar,
      is_pro: is_pro,
    });
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    // get the opt from the request
    let { otp, email } = req.value.body;

    //Get OTP and check validity and its matching
    const account = await Account.findOne({ email });

    if (account) {
      if (getTimestamp(account.otp_expired_at) < getTimestamp(new Date())) {
        return res.status(400).json({
          message:
            "OTP entered is expired. Please generate a new OTP and try again",
          verified: false,
        });
      }

      if (account.otp != otp) {
        return res
          .status(400)
          .json({ message: "Invalid One-Time Password", verified: false });
      }

      //response
      res.status(200).json({
        message: "Otp has been verfiied",
        verified: true,
        account_id: account._id,
      });
    } else {
      return res.status(404).json({
        message: `We could not find any account assosiated with ${email}`,
        verified: false,
      });
    }
  },

  verifyAccount: async (req: Request, res: Response, next: NextFunction) => {
    // get the opt from the request
    let { otp, email } = req.value.body;

    //Get OTP and check validity and its matching
    let account = await Account.findOne({ email });

    if (account) {
      if (getTimestamp(account.otp_expired_at) < getTimestamp(new Date())) {
        return res.status(400).json({
          message:
            "OTP entered is expired. Please generate a new OTP and try again",
          verified: false,
        });
      }

      if (account.otp != otp) {
        return res
          .status(400)
          .json({ message: "Invalid One-Time Password", verified: false });
      }

      account.otp = undefined;
      account.active = true;
      await account.save();

      // genertate token and send it as response
      const token = signToken(account, false);

      let is_pro = false;
      let subscriptionData = await Subscription.findOne({ _id: account._id });
      if (subscriptionData && subscriptionData.active == true) {
        is_pro = true;
      }

      //response
      res.status(200).json({
        message: "Account has been verfiied",
        verified: true,
        account: {
          id: account._id,
          token: token,
          email: account.email,
          username: account.username,
          avatar: account.avatar,
          is_pro: is_pro,
        },
      });
    } else {
      return res.status(404).json({
        message: `We could not find any account assosiated with ${email}`,
        verified: false,
      });
    }
  },

  setPassword: async (req: Request, res: Response, next: NextFunction) => {
    // get the password from request
    let { password, account_id, otp } = req.value.body;

    // get the current account details
    const account = await Account.findOne({ _id: account_id, otp: otp });
    if (account) {
      // generate salt
      const salt = await bcrypt.genSalt(10);

      // generate the password hash (salt + password)
      const passwordHash = await bcrypt.hash(password, salt);

      // assign  hashed  version  over original , plain text password
      account.password = passwordHash;
      account.otp = undefined;
      await account.save();
      res
        .status(200)
        .json({ message: "Your password has been reset Successfully." });
    } else {
      return res
        .status(400)
        .json({ message: "Sorry OTP has expired or invalid" });
    }
  },

  reSetPassword: async (req: Request, res: Response, next: NextFunction) => {
    // get the password from request
    let { password, email, otp } = req.value.body;

    // get the current account details
    const account = await Account.findOne({ email: email, otp: otp });
    if (account) {
      // generate salt
      const salt = await bcrypt.genSalt(10);

      // generate the password hash (salt + password)
      const passwordHash = await bcrypt.hash(password, salt);

      // assign  hashed  version  over original , plain text password
      account.password = passwordHash;
      account.otp = undefined;
      await account.save();
      res.status(200).json({
        message: "Your password has been reset Successfully, please login!",
      });
    } else {
      return res
        .status(400)
        .json({ message: "Sorry OTP has expired or invalid" });
    }
  },

  resendOTP: async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.value.body;

    // check is an account with same email exisit already
    const foundAccount = await Account.findOne({ email });
    if (!foundAccount) {
      return res
        .status(403)
        .json({ error: "Account with email id " + email + " not found" });
    }

    // genrate
    let otp = Math.floor(10000 + Math.random() * 90000);
    // save new otp to the user
    foundAccount.otp = otp;
    foundAccount.otp_expired_at = otpExpireTime();
    let updatedAccount = await foundAccount.save();
    if (!updatedAccount) {
      return res.status(400).json({ message: "Sorry something went wrong! " });
    }

    // send confirmation email
    //await mailService.sendOtpEmail(email, otp, '', 'Ghatz OTP', 'd-388f85532bc343c593b8ce95297d754b');

    // resopnd with token
    res.status(200).json({
      message: " Email with One Time Password has been sent to the " + email,
    });
  },

  recoverAccount: async (req: Request, res: Response, next: NextFunction) => {
    // get the reset email fro the request
    let { email } = req.value.body;

    // check is an account with same email exisit
    const founAccount = await Account.findOne({ email });
    if (!founAccount) {
      return res
        .status(403)
        .json({ error: "Account with email " + email + " not found" });
    }

    if (founAccount && founAccount.is_suspened == true) {
      return res.status(403).json({
        error:
          "Account with email " +
          email +
          " is  suspened please contact support@ghatz.io",
      });
    }

    if (founAccount && founAccount.active == false) {
      return res.status(403).json({
        error:
          "Account with email " +
          email +
          " is  not activated please complete your  account verification",
      });
    }

    // genrate
    let otp = Math.floor(10000 + Math.random() * 90000);

    const otp_expired_at = otpExpireTime();
    await Account.update(
      { email },
      { $set: { otp: otp, otp_expired_at: otp_expired_at } }
    );

    // send reset email
    // await mailService.sendOtpEmail(email, otp,'','Ghatz OTP','d-388f85532bc343c593b8ce95297d754b');

    res
      .status(200)
      .json({ message: "A email with OTP has been send to " + email });
  },

  getAccount: async (req: Request, res: Response, next: NextFunction) => {
    let accountData = await Account.findOne({
      _id: req.user._id,
      active: true,
    }).select("-password -otp -otp_expired_at");
    if (!accountData) {
      return res.status(400).json({ message: "Account not found" });
    }

    let is_pro = false;
    let subscriptionData = await Subscription.findOne({ _id: req.user._id });
    if (subscriptionData && subscriptionData.active == true) {
      is_pro = true;
    }

    res.status(200).json({ ...accountData, is_pro: is_pro });
  },
};
