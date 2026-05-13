import { DataSource } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { config } from 'dotenv';
import { Attendee } from '../rsvp/entities/attendee.entity';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'base_sports',
  entities: [Event, Attendee, User],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();

  const eventRepository = dataSource.getRepository(Event);
  const userRepository = dataSource.getRepository(User);

  // Seed Admin User
  const existingUser = await userRepository.findOne({ where: { email: 'admin@baselinelive.com' } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('BaseLineLive2024!', 10);
    const user = userRepository.create({
      email: 'admin@baselinelive.com',
      password: hashedPassword,
    });
    await userRepository.save(user);
    console.log('Seeding completed: Created admin user (admin@baselinelive.com / BaseLineLive2024!)');
  } else {
    console.log('Seeding skipped: Admin user already exists.');
  }


  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
