export default {
  port: 1337,
  host: "localhost",
  dbUri: process.env.dbURI || "mongodb://localhost/rest-api",
  JWT_SECRET: "",
};
