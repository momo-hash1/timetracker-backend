const dayAddSchema = {
  body: {
    type: "object",
    required: ["minutes", "difficulty"],
    properties: {
      minutes: { type: "number", minimum: 1 },
      difficulty: { type: "number", maximum: 4, minimum: 1 },
      taskId: { type: "number" },
    },
  },
  querystring: {
    type: "object",
    required: ["userToken", "timediaryId"],
    properties: {
      userToken: { type: "string" },
      timediaryId: { type: "number" },
    },
  },
  params: {
    type: "object",
    required: ["month", "year", "day"],
    properties: {
      month: { type: "number", minimum: 0 },
      year: { type: "number", minimum: 0 },
      day: { type: "number", minimum: 0, maximum: 31 },
    },
  },
};

const getDaysSchema = {
  params: {
    type: "object",
    required: ["month", "year"],
    properties: {
      month: { type: "number", minimum: 0 },
      year: { type: "number", minimum: 0 },
    },
  },
  querystring: {
    type: "object",
    required: ["userToken", "timediaryId"],
    properties: {
      userToken: { type: "string" },
      timediaryId: { type: "number" },
      offset: { type: "number", minimum: 0 },
    },
  },
};

const getYearSchema = {
  querystring: {
    type: "object",
    required: ["userToken", "timediaryId"],
    properties: {
      userToken: { type: "string" },
      timediaryId: { type: "number" },
    },
  },
};

const getTaskSchema = {
  querystring: {
    type: "object",
    required: ["userToken", "timediaryId"],
    properties: {
      userToken: { type: "string" },
      timediaryId: { type: "number" },
      offset: { type: "number", minimum: 0 },
    },
  },
};

const addTaskSchema = {
  querystring: {
    type: "object",
    required: ["userToken", "timediaryId"],
    properties: {
      userToken: { type: "string" },
      timediaryId: { type: "number" },
    },
  },
  body: {
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string" },
    },
  },
};

export {
  dayAddSchema,
  getDaysSchema,
  getYearSchema,
  getTaskSchema,
  addTaskSchema,
};
