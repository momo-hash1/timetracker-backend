const { Sequelize, DataTypes } = require("sequelize");

const { getErrorMsg } = require("./helpMessages");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./timeline.db",
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

const Year = sequelize.define("Year", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  year: { type: DataTypes.INTEGER },
});

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

TimeDiary.hasMany(Day);
Day.belongsTo(TimeDiary);

TimeDiary.hasMany(Task);
Task.belongsTo(TimeDiary);

TimeDiary.hasMany(Year);
Year.belongsTo(TimeDiary);

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
});

User.hasMany(Day);
Day.belongsTo(User);

User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(TimeDiary);
TimeDiary.belongsTo(User);

User.hasMany(Year);
Year.belongsTo(User);

const tryExecute = async (send, callback) => {
  try {
    await callback();
  } catch (error) {
    console.log(error);
    send(getErrorMsg("Error occur"));
  }
};

(async () => await sequelize.sync())();

module.exports = { Day, Task, User, TimeDiary, Year, tryExecute };
