import mongoose from "mongoose";
import config from "config";
import log from "../utils/logger";

async function connectToDb() {
  const dbUri = config.get<string>("dbUri");
  try {
    await mongoose.connect(dbUri);
    log.info("Database connected");
  } catch (error) {
    log.error(`Error repoted on: ${new Date()}`);
    log.error(`Error on db connection: ${error}`);
    process.exit(1);
  }
}

export default connectToDb;
