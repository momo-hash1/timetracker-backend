import Fastify from "fastify";
import {
  buildQueryDay,
  buildContentQueryDay,
  buildQueryTimeline,
} from "./buildQuery.js";
import { isHelpMessage } from "./helpMessages.js";
import { Day } from "./models.js";
import { dayAddSchema, messageSchema } from "./schema.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" });
});

fastify.post(
  "/timeline/:year/:month/:day",
  { schema: { ...dayAddSchema, ...messageSchema } },
  async (request, reply) => {
    const query = await buildQueryDay({ ...request.params, ...request.query });

    if (isHelpMessage(query)) {
      reply.send(query);
    }

    const foundDay = await Day.findOne({ where: { ...query } });
    if (foundDay !== null) {

      await Day.update(buildContentQueryDay(request.body), {
        where: { id: foundDay.id },
      });
      reply.send({ type: "done", message: "day updated" });
      return;
    }

    try {
      await Day.create(buildContentQueryDay(request.body, query));

      reply.send({ type: "done", message: "day marked" });
    } catch (error) {
      console.log(error);

      reply.send({ type: "error", message: "error occur" });
    }
  }
);

fastify.get("/timeline/:year/:month", (request, reply) => {
  const query = buildQueryTimeline(request.params);
});

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
