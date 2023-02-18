const types = {
  error: "error",
  done: "done",
};

const getErrorMsg = (msg) => {
  return { type: types.error, message: msg };
};

const getInfoMsg = (msg) => {
  return { type: types.done, message: msg }
}

const isHelpMessage = (obj) => {
  return obj.type !== undefined;
};

module.exports = { getErrorMsg, isHelpMessage, getInfoMsg };
