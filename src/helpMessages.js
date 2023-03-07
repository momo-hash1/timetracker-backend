const types = {
  error: "error",
  done: "info",
};

const getErrorMsg = (msg) => {
  return { type: types.error, title: msg };
};

const getInfoMsg = (msg) => {
  return { type: types.done, title: msg }
}

const isHelpMessage = (obj) => {
  return obj.type !== undefined;
};

module.exports = { getErrorMsg, isHelpMessage, getInfoMsg };
