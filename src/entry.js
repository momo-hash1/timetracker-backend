import { timediaryAndUserAccess, userAccess } from "./auth.js";
import { isHelpMessage, getInfoMsg, getErrorMsg } from "./helpMessages.js";
import { tryExecute } from "./models.js";
import { Op } from "sequelize";

const addEntry = async (model, query, column, reply) => {
  const accessPick = await timediaryAndUserAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  tryExecute(reply.send, async () => {
    await model.create({
      ...column,
      UserId: accessPick.userId,
      TimeDiaryId: accessPick.timediaryId,
    });
  });
  reply.send(getInfoMsg(`entry added`));
};

const updateEntry = async (model, query, column, id, reply) => {
  if (!(await entryExists(model, id))) {
    reply.send(getErrorMsg("entry unknown"));
  }

  const accessPick = await timediaryAndUserAccess(query);
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
  const accessPick = await userAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  reply.send(
    await model.findAll({
      where: { [column]: { [Op.like]: `%${searchQuery}%` } },
    })
  );
};

const deleteEntry = async (model, query, id, reply) => {
  const accessPick = userAccess(query);
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }

  tryExecute(reply.send, async () => {
    await model.destroy({ where: { id: id } });
  });
  reply.send(getInfoMsg("entry deleted"));
};

const getEntries = async (model, offset, accessPick, reply) => {
  if (isHelpMessage(accessPick)) {
    reply.send(accessPick);
    return;
  }
  reply.send(
    await model.findAll({
      where: { ...accessPick },
      offset: offset,
    })
  );
};

const entryExists = async (model, entryId) => {
  return (await model.findOne({ where: { id: entryId } })) !== null;
};

export { addEntry, updateEntry, searchEntry, deleteEntry, getEntries };
