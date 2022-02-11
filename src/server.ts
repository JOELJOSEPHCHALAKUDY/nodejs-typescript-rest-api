import express, { Request, Response, NextFunction } from "express";
import config from "config";
import morgan from "morgan";
import http from "http";

import log from "./utils/logger";
import { HttpError } from "./utils/http-error";

const port: number = config.get("port");
const host: string = config.get("host");

const app = express();
const httpServer = http.createServer(app);

// load the routes
import routes from "./router/index";
import connectToDb from "./utils/db-connect";

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  // website you wish to  allow to connet
  res.setHeader("Access-Control-Allow-Origin", "*");

  // request method you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTION, PUT, PATCH, DELETE"
  );

  // request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization,skip"
  );

  // set to true if you need the website to include  cookies  in the  request  sent
  // to the API (eg. in case you can see sessions )
  res.setHeader("Access-Control-Allow-Credentials", "false");

  // pass to the next layer of middleware
  next();
});

// attach the routes
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "Welcome to Api Endpoint",
  });
});

app.use("/api", routes);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new HttpError("Not Found", 404);
  next(err);
});

// error handler functon
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const error = app.get("env") === "development" ? err : {};
  const status = err.status || 500;

  // respond to client
  res.status(status).json({
    error: {
      message: error.message,
    },
  });

  // respond to ourself
  log.error(err);
});

httpServer.listen(port, host, () => {
  log.info(`Server listing at http://${host}:${port}`);
  connectToDb();
});
