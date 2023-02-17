import crypto from "crypto";

const LIMIT_DAYS = 10;

const SECRETKEY = crypto.randomBytes(5).toString("hex");
const iv = crypto.randomBytes(16);
const key = crypto.scryptSync(SECRETKEY, crypto.randomBytes(16), 24);


export { LIMIT_DAYS, SECRETKEY, key, iv };
