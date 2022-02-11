import joi from "joi";
import { Schema } from "mongoose";
import { Request, Response, NextFunction } from "express";

const validateParams = (schema: any, name: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.validate({ param: req["params"][name] });
    if (result.error) {
      return res.status(400).json(result.error);
    }

    if (!req.value) {
      req.value = {};
    }

    if (!req.value["params"]) {
      req.value["params"] = [];
    }

    req.value.params[name] = result.value.param;
    next();
  };
};

const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.validate(req.body);

    if (result.error) {
      return res.status(400).json(result.error);
    }
    if (!req.value) {
      req.value = {};
    }
    req.value.body = result.value;
    next();
  };
};

const schemas = {
  authSchema: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),
    remember_me: joi.boolean().required(),
  }),
  signupSchema: joi.object().keys({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
  idSchema: joi.object().keys({
    param: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
  verifyOtpSchema: joi.object().keys({
    otp: joi.number().required(),
    email: joi.string().email().required(),
  }),
  emailSchema: joi.object().keys({
    email: joi.string().email().required(),
  }),
  passwordResetSchema: joi.object().keys({
    password: joi.string().required(),
    otp: joi.number().required(),
    email: joi.string().email().required(),
  }),
  passwordSetSchema: joi.object().keys({
    password: joi.string().required(),
    account_id: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    otp: joi.string().required(),
  }),
};

export { validateParams, validateBody, schemas };
