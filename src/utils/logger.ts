import pino from "pino";
import dayjs from "dayjs";

const transport = pino.transport({
  target: "pino-pretty",
  options: { colorize: true, translateTime: "SYS:dd-mm-yyyy HH:MM:ss" },
});

const log = pino(
  {
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
  },
  transport
);

export default log;
