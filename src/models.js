import { Sequelize, DataTypes } from "sequelize";

const initSequelize = async () => {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./timeline.db",
  });

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  return sequelize;
};

const getModels = async () => {
  const sequelize = await initSequelize();

  const Day = sequelize.define("Day", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    year: { type: DataTypes.NUMBER },
    month: { type: DataTypes.NUMBER },
    day: { type: DataTypes.NUMBER },
    minutes: { type: DataTypes.NUMBER },
    difficulty: { type: DataTypes.NUMBER },
  });

  const Task = sequelize.define("Task", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING },
  });

  Task.hasMany(Day);
  Day.belongsTo(Task);


  const TimeDiary = sequelize.define("TimeDiary", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING },
  });

  TimeDiary.hasOne(Day);
  Day.belongsTo(TimeDiary);

  TimeDiary.hasOne(Task);
  TimeDiary.belongsTo(Task);

  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
  });

  User.hasOne(Day);
  Day.belongsTo(User);

  User.hasOne(Task);
  Task.belongsTo(User);

  User.hasOne(TimeDiary);
  TimeDiary.belongsTo(TimeDiary);

  await sequelize.sync({ force: true });

  return Day, Task, User, TimeDiary;
};

export default getModels;
