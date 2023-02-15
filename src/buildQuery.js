import { timediaryAndUserAccess } from "./auth.js";
import { isHelpMessage } from "./helpMessages.js";

const buildQueryDay = async (pick) => {
  pick = await timediaryAndUserAccess(pick);
  if (isHelpMessage(pick)) {
    return pick;
  }

  return {
    month: pick.month,
    year: pick.year,
    day: pick.day,
    TimeDiaryId: pick.timediaryId,
    UserId: pick.userId,
  };
};

const buildQueryTimeline = (pick) => {
  const dayQuery =  buildQueryDay(pick)
  delete dayQuery.day;
  return dayQuery
}

const buildContentQueryDay = (content, pick={}) => {
  return {
    ...pick,
    TaskId: content.taskId,
    minutes: content.minutes,
    difficulty: content.difficulty,
  };
};

export { buildQueryDay, buildContentQueryDay, buildQueryTimeline };
