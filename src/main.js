import Fastify from "fastify";
import { encodeObj, timediaryAndUserAccess, userAccess } from "./auth.js";
import {
  buildQueryDay,
  buildContentQueryDay,
  buildQueryTimeline,
} from "./buildQuery.js";
import { LIMIT_DAYS, SECRETKEY } from "./constants.js";
import {
  addEntry,
  deleteEntry,
  getEntries,
  searchEntry,
  updateEntry,
} from "./entry.js";
import { getErrorMsg, getInfoMsg, isHelpMessage } from "./helpMessages.js";
import { Day, Task, TimeDiary, tryExecute, User, Year } from "./models.js";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" });
});

fastify.get("/timeline/:year/:month", async (request, reply) => {
  const query = await buildQueryTimeline({
    ...request.params,
    ...request.query,
  });
  const userHaveDays = await Day.findOne({ where: { UserId: query.UserId } });
  if (userHaveDays === null) {
    reply.send(getErrorMsg("User dont have any days"));
    return;
  }
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
});

fastify.post("/timeline/:year/:month/:day", async (request, reply) => {
  const query = await buildQueryDay({ ...request.params, ...request.query });

  if (isHelpMessage(query)) {
    reply.send(query);
    return;
  }

  console.log(query);

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
});

fastify.get("/years/available", async (request, reply) => {
  await getEntries(
    Year,
    request.query.offset,
    timediaryAndUserAccess(request.query),
    reply
  );
});

fastify.get("/tasks/available", async (request, reply) => {
  await getEntries(
    Task,
    request.query.offset,
    timediaryAndUserAccess(request.query),
    reply
  );
});

fastify.post("/tasks/add", async (request, reply) => {
  await addEntry(Task, request.query, { title: request.body.title }, reply);
});

fastify.post(
  "/tasks/:id",

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
    await userAccess(request.query),
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
  const accessPick = await userAccess(request.query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  reply.send(await User.findOne({ where: { id: request.params.id } }));
});

fastify.post("/user/:id", async (request, reply) => {
  const accessPick = await userAccess(request.query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  await User.update({ where: { id: request.params.id } });
  reply.send(getInfoMsg("user updated"));
});

fastify.post("/user/add", async (request, reply) => {
  const foundUser = await User.findOne({
    where: { email: request.body.email },
  });
  if (foundUser !== null) {
    reply.send(getErrorMsg("user with this email exists"));
  }

  try {
    const createdUser = await User.create({
      email: request.body.email,
      password: request.body.password,
    });
    reply.send(encodeObj({ userId: createdUser.id }));
  } catch (error) {
    console.log(error);
    reply.send(getErrorMsg("error occur"));
  }
});

fastify.delete("/user", async (request, reply) => {
  const pickAccess = await userAccess(request.query);
  if (isHelpMessage(pickAccess)) {
    reply.send(pickAccess);
    return;
  }
  try {
    await User.destroy({ where: { id: pickAccess.userId } });
    reply.send(getInfoMsg("user added"));
  } catch (error) {
    console.log(error);
    reply.send(getErrorMsg("error occur"));
  }
});
fastify.post("/user/auth", async (request, reply) => {
  const foundUser = await User.findOne({
    where: { email: request.body.email },
  });
  if (foundUser === null) {
    reply.send("User unknown");
    return;
  }
  if (foundUser.password !== request.body.password) {
    reply.send("wrong password");
    return;
  }
  const token = encodeObj({ userId: foundUser.id });
  reply.send(token);
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
