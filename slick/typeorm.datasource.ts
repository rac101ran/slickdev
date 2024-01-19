import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: configService.get('DATABASE_URL_MASTER'),
  entities: ['dist/**/*.entity{ .ts,.js}'],
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
