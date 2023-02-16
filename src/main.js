import Fastify from "fastify";
import { Op } from "sequelize";
import { timediaryAndUserAccess, userAccess } from "./auth.js";
import {
  buildQueryDay,
  buildContentQueryDay,
  buildQueryTimeline,
} from "./buildQuery.js";
import { LIMIT_DAYS } from "./constants.js";
import {
  addEntry,
  deleteEntry,
  getEntries,
  searchEntry,
  updateEntry,
} from "./entry.js";
import { getErrorMsg, getInfoMsg, isHelpMessage } from "./helpMessages.js";
import { Day, Task, TimeDiary, tryExecute, Year } from "./models.js";
import { dayAddSchema, getDaysSchema, entrySchema } from "./schema.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" });
});

fastify.get(
  "/timeline/:year/:month",
  { schema: getDaysSchema },
  async (request, reply) => {
    const query = await buildQueryTimeline({
      ...request.params,
      ...request.query,
    });

    if (isHelpMessage(query)) {
      reply.send(query);
      return;
    }

    reply.send(
      await Day.findAll({
        limit: LIMIT_DAYS,
        offset: request.query.offset,
        where: { ...query },
      })
    );
  }
);

fastify.post(
  "/timeline/:year/:month/:day",
  { schema: dayAddSchema },
  async (request, reply) => {
    const query = await buildQueryDay({ ...request.params, ...request.query });

    if (isHelpMessage(query)) {
      reply.send(query);
      return;
    }

    const foundDay = await Day.findOne({ where: { ...query } });
    if (foundDay !== null) {
      await Day.update(buildContentQueryDay(request.body), {
        where: { id: foundDay.id },
      });
      reply.send(getInfoMsg("day updated"));
      return;
    }

    tryExecute(reply.send, async () => {
      await Day.create(buildContentQueryDay(request.body, query));
    });
    reply.send(getInfoMsg("day marked"));
  }
);

fastify.get(
  "/years/available",
  { schema: entrySchema },
  async (request, reply) => {
    await getEntries(
      Year,
      request.query.offset,
      timediaryAndUserAccess(request.query),
      reply
    );
  }
);

fastify.get(
  "/tasks/available",
  { schema: entrySchema },
  async (request, reply) => {
    await getEntries(
      Task,
      request.query.offset,
      timediaryAndUserAccess(request.query),
      reply
    );
  }
);

fastify.post("/tasks/add", { schema: entrySchema }, async (request, reply) => {
  await addEntry(Task, request.query, { title: request.body.title }, reply);
});

fastify.post(
  "/tasks/:id",
  {
    schema: {
      ...entrySchema,
      params: {
        type: "object",
        properties: {
          id: { type: "number" },
        },
      },
    },
  },
  async (request, reply) => {
    await updateEntry(
      Task,
      request.query,
      { title: request.body.title },
      request.params.id,
      reply
    );
  }
);
fastify.get("/tasks/search/:search", async (request, reply) => {
  await searchEntry(Task, request.query, "title", request.params.search, reply);
});
fastify.delete("/tasks/:id", async (request, reply) => {
  await deleteEntry(Task, request.query, request.params.id, reply);
});

fastify.get("/timediaries/available", async (request, reply) => {
  await getEntries(
    TimeDiary,
    request.query.offset,
    userAccess(request.query),
    reply
  );
});
fastify.post("/timediaries/add", async (request, reply) => {
  await addEntry(
    TimeDiary,
    request.query,
    { title: request.body.title },
    reply
  );
});
fastify.delete("/timediaries/:id", async (request, reply) => {
  await deleteEntry(TimeDiary, request.query, request.params.id, reply);
});

fastify.get("/user/:id", async (request, reply) => {
  const accessPick = userAccess(request.query)
  if(isHelpMessage(accessPick)){
    reply.send(accessPick)
    return
  }

});
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
