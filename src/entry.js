const { Op } = require("sequelize");

const { timediaryAndUserAccess, userAccess } = require("./auth.js");
const { LIMIT_DAYS } = require("./constants.js");
const { isHelpMessage, getInfoMsg, getErrorMsg } = require("./helpMessages.js");
const { tryExecute } = require("./models.js");

const addEntry = async (model, query, column, reply) => {
  const accessPick =
    query.timediaryId === "undefined"
      ? await userAccess(query)
      : await timediaryAndUserAccess(query);

  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  return await tryExecute(reply.send, async () => {
    return await model.create({
      ...column,
      UserId: accessPick.userId,
      TimeDiaryId: accessPick.timediaryId,
    });
  });
};

const updateEntry = async (model, query, column, id, reply) => {
  id = parseInt(id);
  const isExist = await entryExists(model, id);
  if (!isExist) {
    reply.send(getErrorMsg("entry unknown"));
    return;
  }

  const accessPick = await userAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  tryExecute(reply.send, async () => {
    await model.update(column, { where: { id: id } });
  });
  reply.send(getInfoMsg("entry updated"));
};

const searchEntry = async (model, query, column, searchQuery, reply) => {
  const accessPick = await timediaryAndUserAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  const timediaryHaveTasks = await model.findOne({
    where: { TimeDiaryId: query.timediaryId },
  });
  if (timediaryHaveTasks === null) return;

  reply.send(
    await model.findAll({
      where: {
        [column]: {
          [Op.like]: `%${searchQuery}%`,
        },
        TimeDiaryId: query.timediaryId,
      },
    })
  );
};

const deleteEntry = async (model, query, id, reply) => {
  const accessPick = userAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  return await tryExecute(reply.send, async () => {
    return await model.destroy({ where: { id: id } });
  });
};

const getEntries = async (model, offset, accessPick, reply) => {
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  const entries = await model.findAll({
    where: { ...accessPick },
    offset: offset * LIMIT_DAYS,
    limit: LIMIT_DAYS,
    order: [["id", "DESC"]],
  });
  reply.send({ hasNext: entries.length !== 0, entries: entries });
};

const entryExists = async (model, entryId) => {
  return (await model.findOne({ where: { id: entryId } })) !== null;
};

module.exports = {
  addEntry,
  updateEntry,
  searchEntry,
  deleteEntry,
  getEntries,
};
