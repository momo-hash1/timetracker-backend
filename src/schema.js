const dayAddSchema = {
  body: {
    type: "object",
    required: ["minutes", "difficulty", "userId", "timediaryId", "id"],
    properties: {
      minutes: { type: "number", minimum: 1 },
      difficulty: { type: "number", maximum: 4, minimum: 1 },
      taskId: { type: "number" },
      userId: { type: "number" },
      timediaryId: { type: "number" },
      id: { type: "number" },
    },
  },
};

const messageSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        type: { enum: ["error", "ok"] },
        message: { type: "string" },
      },
    },
  },
};

export { dayAddSchema, messageSchema };
