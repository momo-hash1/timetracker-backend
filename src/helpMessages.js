const types = {
  error: "error",
  done: "done",
};

const getErrorMsg = (msg) => {
  return { type: types.error, message: msg };
};

const isHelpMessage = (obj) => {
  return obj.type !== undefined;
};

export { getErrorMsg, isHelpMessage };
