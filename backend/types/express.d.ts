import { Meta } from "../src/core/api-response/response.types";

declare global {
  namespace express {
    interface Locals {
      meta: Meta;
    }
  }
}

export {};
