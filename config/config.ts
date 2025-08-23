import dotenv from "dotenv";
dotenv.config();
import { Dialect } from "sequelize";

interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
}

const development: DBConfig = {
  username: process.env?.DB_USERNAME || "postgres",
  password: process.env?.DB_PASSWORD || "",
  database: process.env?.DB_NAME || "secure_task_management",
  host: process.env?.DB_HOST || "localhost",
  port: Number(process.env?.DB_PORT) || 5432,
  dialect: "postgres",
};

const test: DBConfig = {
  username: process.env?.DB_USERNAME || "postgres",
  password: process.env?.DB_PASSWORD || "",
  database: process.env?.DB_NAME || "secure_task_management_test",
  host: process.env?.DB_HOST || "localhost",
  port: Number(process.env?.DB_PORT) || 5432,
  dialect: "postgres",
};

const production = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
};

export default { development, test, production };
