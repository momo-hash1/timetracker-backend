import Fastify from "fastify";
import { Day, User } from "./models.js";
import { dayAddSchema, messageSchema } from "./schema.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" });
});

const getDayQuery = (body, params) => {
  return {
    month: params.month,
    year: params.year,
    day: body.day,
    minutes: params.minutes,
    difficulty: body.difficulty,
    TaskId: body.taskId,
    TimeDiaryId: body.timediaryId,
    UserId: body.userId,
  };
};

fastify.post(
  "/timeline/:year/:month/:day",
  { schema: { ...dayAddSchema, ...messageSchema } },
  async (request, reply) => {
    const { id } = request.body;

    if (id !== null) {
      await Day.update(getDayQuery(request.body, request.params), {
        where: { id: id },
      });
      return;
    }
    try {
      await Day.create(getDayQuery(request.body, request.params));
      reply.send({ type: "ok", message: "day marked" });
    } catch (error) {
      console.log(error);
      reply.send({ type: "error", message: "error occur" });
    }
  }
);

fastify.get("/timeline/:year/:month", (request, reply) => {});

fastify.get("/years/available", (request, reply) => {});

fastify.get("/tasks/", (request, reply) => {});
fastify.post("/tasks/add", (request, reply) => {});
fastify.post("/tasks/:id", (request, reply) => {});
fastify.get("/tasks/:id", (request, reply) => {});
fastify.delete("/tasks/:id", (request, reply) => {});

fastify.get("/timediaries/available", (request, reply) => {});
fastify.delete("/timediaries/:id", (request, reply) => {});
fastify.post("/timediaries/add", (request, reply) => {});
fastify.post("/timediaries/:id", (request, reply) => {});

fastify.get("/user/:id", (request, reply) => {});
fastify.post("/user/:id", (request, reply) => {});
fastify.post("/user/add", (request, reply) => {});
fastify.delete("/user/:id", (request, reply) => {});
fastify.post("/user/auth", (request, reply) => {});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
