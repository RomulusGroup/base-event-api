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
  const existingUser = await userRepository.findOne({ where: { email: 'admin@basesports.io' } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('BaseSports2024!', 10);
    const user = userRepository.create({
      email: 'admin@basesports.io',
      password: hashedPassword,
    });
    await userRepository.save(user);
    console.log('Seeding completed: Created admin user (admin@basesports.io / BaseSports2024!)');
  } else {
    console.log('Seeding skipped: Admin user already exists.');
  }

  // Seed Event
  const existingEvent = await eventRepository.findOne({ where: { title: 'Base Sports Invitational' } });

  if (!existingEvent) {
    const event = eventRepository.create({
      title: 'Base Sports Invitational',
      description: 'The premier sports networking event of the year.',
      date: new Date('2026-05-25T18:00:00'),
      location: 'Lagos, Nigeria',
      maxCapacity: 200,
      ticketPrefix: 'BASE',
      galleryUrls: ['https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=2000&auto=format&fit=crop'],
    });

    await eventRepository.save(event);
    console.log('Seeding completed: Created initial event.');
  } else {
    console.log('Seeding skipped: Event already exists.');
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
