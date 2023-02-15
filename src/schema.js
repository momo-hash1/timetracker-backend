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
};

const messageSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        type: { enum: ["error", "done"] },
        message: { type: "string" },
      },
    },
  },
};

export { dayAddSchema, messageSchema };
