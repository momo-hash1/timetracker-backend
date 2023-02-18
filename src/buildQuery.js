const { timediaryAndUserAccess } = require("./auth.js");
const { isHelpMessage } = require("./helpMessages.js");
const { Year } = require("./models");

const createYear = async (year, timediaryId) => {
  if (
    (await Year.findOne({
      where: { year: year, TimeDiaryId: timediaryId },
    })) === null
  ) {
    await Year.create({ year: year, TimeDiaryId: timediaryId });
  }
};

const buildQueryDay = async (pick) => {
  pick = await timediaryAndUserAccess(pick);
  if (isHelpMessage(pick)) {
    return pick;
  }

  createYear(pick.year, pick.timediaryId);

  return {
    month: pick.month,
    year: pick.year,
    day: pick.day,
    TimeDiaryId: pick.timediaryId,
    UserId: pick.userId,
  };
};

const buildContentQueryDay = (content, pick = {}) => {
  return {
    ...pick,
    TaskId: content.taskId,
    minutes: content.minutes,
    difficulty: content.difficulty,
  };
};

const buildQueryTimeline = async (pick) => {
  const dayQuery = await buildQueryDay(pick);

  if (isHelpMessage(dayQuery)) return dayQuery;

  delete dayQuery.day;

  return dayQuery;
};

module.exports = { buildQueryDay, buildContentQueryDay, buildQueryTimeline };
