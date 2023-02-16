import Fastify from "fastify";
import { Op } from "sequelize";
import { timediaryAndUserAccess, userAccess } from "./auth.js";
import {
  buildQueryDay,
  buildContentQueryDay,
  buildQueryTimeline,
} from "./buildQuery.js";
import { LIMIT_DAYS } from "./constants.js";
import { getErrorMsg, getInfoMsg, isHelpMessage } from "./helpMessages.js";
import { Day, Task, tryExecute, Year } from "./models.js";
import {
  addTaskSchema,
  dayAddSchema,
  getDaysSchema,
  getTaskSchema,
  getYearSchema,
} from "./schema.js";

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
  { schema: getYearSchema },
  async (request, reply) => {
    const userAccessPick = timediaryAndUserAccess(request.query);
    if (isHelpMessage(userAccessPick)) {
      reply.send(userAccessPick);
      return;
    }
    reply.send(await Year.findAll({ where: { ...userAccessPick } }));
  }
);

fastify.get("/tasks/available", { schema: getTaskSchema }, async (request, reply) => {
  const accessPick = timediaryAndUserAccess(request.query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  reply.send(
    await Task.findAll({
      where: { ...accessPick },
      offset: request.query.offset,
    })
  );
});

fastify.post(
  "/tasks/add",
  { schema: addTaskSchema },
  async (request, reply) => {
    const accessPick = await timediaryAndUserAccess(request.query);
    if (isHelpMessage(accessPick)) {
      reply.send(accessPick);
      return;
    }

    tryExecute(reply.send, async () => {
      await Task.create({
        title: request.body.title,
        UserId: accessPick.userId,
        TimeDiaryId: accessPick.timediaryId,
      });
    });
    reply.send(getInfoMsg("task added"));
  }
);

fastify.post(
  "/tasks/:id",
  {
    schema: {
      ...addTaskSchema,
      params: {
        type: "object",
        properties: {
          id: { type: "number" },
        },
      },
    },
  },
  async (request, reply) => {
    const accessPick = await timediaryAndUserAccess(request.query);
    if (isHelpMessage(accessPick)) {
      reply.send(accessPick);
      return;
    }

    tryExecute(reply.send, async () => {
      await Task.update(
        {
          title: request.body.title,
        },
        { where: { id: request.params.id } }
      );
    });
    reply.send(getInfoMsg("task updated"));
  }
);
fastify.get("/tasks/title/:search", async (request, reply) => {
  const accessPick = await timediaryAndUserAccess(request.query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  reply.send(
    await Task.findAll({
      where: { title: { [Op.like]: `%${request.params.search}%` } },
    })
  );
});
fastify.delete("/tasks/:id", async (request, reply) => {
  const accessPick = userAccess(request.query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  tryExecute(reply.send, async () => {
    await Task.destroy({ where: { id: request.params.id } });
  });
  reply.send(getInfoMsg("task deleted"));
});

fastify.get("/timediaries/available", (request, reply) => {});
fastify.post("/timediaries/add", (request, reply) => {});
fastify.post("/timediaries/:id", (request, reply) => {});
fastify.delete("/timediaries/:id", (request, reply) => {});

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
