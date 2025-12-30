// Handling logging logic here so that it is centralized
//TODO:
import { env } from "./env.js";
import pino from "pino";

const logger = pino();

logger.info("Heelo pino!");
logger.error("An error occurred!");
