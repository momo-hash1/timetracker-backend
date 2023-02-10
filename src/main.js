import Fastify from "fastify";
import getModels from "./models.js";

const fastify = Fastify({
  logger: true,
});

const { Day, TimeDiary, User, Task } = getModels();

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" });
});

fastify.post("/timeline/:year/:month/:day", (request, reply) => {});

fastify.get("/timeline/:year/:month", (request, reply) => {});

fastify.get("/years/available", (request, reply) => {});

fastify.get("/tasks/", (request, reply) => {})
fastify.post("/tasks/add", (request, reply) => {})
fastify.post("/tasks/:id", (request, reply) => {})
fastify.get("/tasks/:id", (request, reply) => {})
fastify.delete("/tasks/:id", (request, reply) => {})

fastify.get("/timediaries/available", (request, reply) => {})
fastify.delete("/timediaries/:id", (request, reply) => {})
fastify.post("/timediaries/add", (request, reply) => {})
fastify.post("/timediaries/:id", (request, reply) => {})

fastify.get("/user/:id", (request, reply) => {})
fastify.post("/user/:id", (request, reply) => {})
fastify.post("/user/add", (request, reply) => {})
fastify.delete("/user/:id", (request, reply) => {})
fastify.post("/user/auth", (request, reply) => {})

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
