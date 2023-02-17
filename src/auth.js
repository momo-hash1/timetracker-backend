import { TimeDiary, User } from "./models.js";
import { getErrorMsg, isHelpMessage } from "./helpMessages.js";
import crypto from "crypto";
import { key, iv } from "./constants.js";

const auth = async (jwtToken) => {
  try {
    const decodedJwt = decodeString(jwtToken);
    const foundUser = await User.findOne({
      where: { id: decodedJwt.userId },
    });
    if (foundUser === null) return null;
    return decodedJwt.userId;
  } catch (error) {
    console.log(error);
    return getErrorMsg("decryption error");
  }
};

const userAccess = async (pick) => {
  if (pick.userToken === undefined || pick.userToken.length === 0)
    return getErrorMsg("User token not provided");

  const verifiedUserId = await auth(pick.userToken);

  if (isHelpMessage(verifiedUserId)) return verifiedUserId;

  if (verifiedUserId === null) return getErrorMsg("User unknown");

  return { ...pick, userId: verifiedUserId };
};

const timediaryAndUserAccess = async (pick) => {
  const userAccessPick = await userAccess(pick);

  if (isHelpMessage(userAccessPick)) {
    return userAccessPick;
  }

  if ((await TimeDiary.findOne({ where: { id: pick.timediaryId } })) === null) {
    return getErrorMsg("Timediary unknown");
  }

  return userAccessPick;
};

const encodeObj = (obj) => {
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);

  return (
    cipher.update(JSON.stringify(obj), "utf-8", "hex") + cipher.final("hex")
  );
};

const decodeString = (string) => {
  string = string.trim();
  const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
  return JSON.parse(
    decipher.update(string, "hex", "utf-8") + decipher.final("utf-8")
  );
};

export { auth, userAccess, timediaryAndUserAccess, decodeString, encodeObj };
