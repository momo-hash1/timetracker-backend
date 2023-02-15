import { TimeDiary } from "./models.js";
import { getErrorMsg } from "./helpMessages.js";

const auth = (jwtToken) => {
  return jwtToken;
};

const userAccess = (pick) => {
  const verifiedUserId = auth(pick.userToken);
  return { ...pick, userId: verifiedUserId };
};

const timediaryAndUserAccess = async (pick) => {
  const userAccessPick = userAccess(pick);

  if (userAccessPick.userId === null) {
    return getErrorMsg("User unknown");
  }
  
  if ((await TimeDiary.findOne({ where: { id: pick.timediaryId } })) === null) {
    return getErrorMsg("Timediary unknown");
  }

  return userAccessPick;
};

export { auth, userAccess, timediaryAndUserAccess };
