const types = {
  error: "error",
  done: "done",
};

const getErrorMsg = (msg) => {
  return { type: types.error, message: msg };
};

const isHelpMessage = (obj) => {
  if (obj.type !== undefined && Object.keys().includes(obj.type)) return true;
};

export { getErrorMsg, isHelpMessage };
