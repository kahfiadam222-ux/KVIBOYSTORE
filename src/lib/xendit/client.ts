import { Xendit } from "xendit-node";

export const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
