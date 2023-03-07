const { timediaryAndUserAccess } = require("./auth.js");
const { isHelpMessage } = require("./helpMessages.js");
const { Year } = require("./models");

const createYear = async (year, timediaryId, userId) => {
  if (
    (await Year.findOne({
      where: { year: year, TimeDiaryId: timediaryId, UserId: userId },
    })) === null
  ) {
    await Year.create({ year: year, TimeDiaryId: timediaryId, UserId: userId });
  }
};

const buildQueryDay = async (pick) => {
  const accessPick = await timediaryAndUserAccess(pick);
  if (isHelpMessage(accessPick)) {
    return pick;
  }

  createYear(pick.year, accessPick.timediaryId, accessPick.userId);

  return {
    month: pick.month,
    year: pick.year,
    day: pick.day,
    TimeDiaryId: accessPick.timediaryId,
    UserId: accessPick.userId,
  };
};

const buildContentQueryDay = (content, pick = {}) => {
  if (content.taskId !== undefined) return { ...pick, TaskId: content.taskId };
  if (content.minutes !== undefined)
    return { ...pick, minutes: content.minutes };
  if (content.difficulty !== undefined)
    return { ...pick, difficulty: content.difficulty };
};

const buildQueryTimeline = async (pick) => {
  const dayQuery = await buildQueryDay(pick);

  if (isHelpMessage(dayQuery)) return dayQuery;

  delete dayQuery.day;

  return dayQuery;
};

module.exports = { buildQueryDay, buildContentQueryDay, buildQueryTimeline };
