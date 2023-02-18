const jwt = require("jsonwebtoken");

const { TimeDiary, User } = require("./models")
const { getErrorMsg, isHelpMessage } = require("./helpMessages")
const { SECRETKEY } = require("./constants");

const auth = async (jwtToken) => {
  try {
    const decodedJwt = jwt.verify(jwtToken, SECRETKEY);
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


module.exports =  { auth, userAccess, timediaryAndUserAccess };
