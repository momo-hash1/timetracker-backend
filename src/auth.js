import { TimeDiary } from "./models.js";
import { getErrorMsg, isHelpMessage } from "./helpMessages.js";

const auth = (jwtToken) => {
  return jwtToken;
};

const userAccess = (pick) => {
  const verifiedUserId = auth(pick.userToken);

  if (verifiedUserId === null) return getErrorMsg("User unknown");

  return { ...pick, userId: verifiedUserId };
};

const timediaryAndUserAccess = async (pick) => {
  const userAccessPick = userAccess(pick);

  if (isHelpMessage(userAccessPick)) {
    return userAccessPick;
  }

  if ((await TimeDiary.findOne({ where: { id: pick.timediaryId } })) === null) {
    return getErrorMsg("Timediary unknown");
  }

  return userAccessPick;
};

export { auth, userAccess, timediaryAndUserAccess };
