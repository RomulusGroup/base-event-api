import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Attendee } from './src/rsvp/entities/attendee.entity';
import { Event } from './src/events/entities/event.entity';
import { User } from './src/auth/entities/user.entity';

config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'base_sports',
  entities: [Attendee, Event, User],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
});
