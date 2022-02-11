// routes/index.js
import express, { Router, Request, Response, NextFunction } from "express";

const router = Router();

import accountRoutes from "./routes/account.routes";

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.send({ message: "app works , you are in api endpoint now" });
});

router.use("/v1", [accountRoutes]);

export default router;
