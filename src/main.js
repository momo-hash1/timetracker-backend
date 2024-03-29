const Fastify = require("fastify");
const jwt = require("jsonwebtoken");
const cors = require("@fastify/cors");
const {
  buildQueryDay,
  buildContentQueryDay,
  buildQueryTimeline,
} = require("./buildQuery.js");
const {
  addEntry,
  deleteEntry,
  getEntries,
  searchEntry,
  updateEntry,
} = require("./entry.js");
const { timediaryAndUserAccess, userAccess } = require("./auth");
const { LIMIT_DAYS, SECRETKEY } = require("./constants");
const { getErrorMsg, getInfoMsg, isHelpMessage } = require("./helpMessages");
const { Day, Task, TimeDiary, tryExecute, User, Year } = require("./models");

const fastify = Fastify({
  logger: true,
});

(async () =>
  await fastify.register(cors, {
    // put your options here
  }))();

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
      where: { ...query },
      include: [Task],
    })
  );
});

fastify.post("/timeline/:year/:month/:day", async (request, reply) => {
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
});

fastify.get("/years/available", async (request, reply) => {
  await getEntries(
    Year,
    request.query.offset,
    await timediaryAndUserAccess(request.query),
    reply
  );
});

fastify.get("/tasks/available", async (request, reply) => {
  await getEntries(
    Task,
    request.query.offset,
    await timediaryAndUserAccess(request.query),
    reply
  );
});

fastify.post("/tasks/add", async (request, reply) => {
  const entry = await addEntry(
    Task,
    request.query,
    { title: request.body.title },
    reply
  );
  reply.send({
    ...getInfoMsg(`Task added`),
    entry: { title: request.body.title, id: entry.id },
  });
});

fastify.post(
  "/tasks/:id",

  async (request, reply) => {
    console.log(request.body);
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
  reply.send({ ...getInfoMsg("Task deleted"), id: request.params.id });
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
  const entry = await addEntry(
    TimeDiary,
    request.query,
    { title: request.body.title },
    reply
  );
  reply.send({ ...getInfoMsg(`Timediary added`), entry: entry });
});
fastify.delete("/timediaries/:id", async (request, reply) => {
  await deleteEntry(TimeDiary, request.query, request.params.id, reply);
  reply.send({ ...getInfoMsg("Timediary deleted"), id: request.params.id });
});

fastify.post("/timediaries/:id", async (request, reply) => {
  console.log(request.body.title);
  await updateEntry(
    TimeDiary,
    request.query,
    { title: request.body.title },
    request.params.id,
    reply
  );
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
    reply.send({
      ...getInfoMsg("you register"),
      userToken: jwt.sign({ userId: createdUser.id }, SECRETKEY),
    });
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
    reply.send(getErrorMsg("User unknown"));
    return;
  }
  if (foundUser.password !== request.body.password) {
    reply.send(getErrorMsg("wrong password"));
    return;
  }
  const token = jwt.sign({ userId: foundUser.id }, SECRETKEY);
  reply.send({ userToken: token });
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
