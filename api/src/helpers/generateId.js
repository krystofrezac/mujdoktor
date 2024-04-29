import crypto from "crypto";

export const generatedId = () => crypto.randomBytes(16).toString("hex");
