import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Env } from "../env-loader";
const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = Env();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: false,
  logging: true,
};

export const seedOrmConfig: TypeOrmModuleOptions = {
  ...typeOrmConfig,
  logging: ['error', 'warn'],
};

export default typeOrmConfig;


