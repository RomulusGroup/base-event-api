import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendee } from '../../rsvp/entities/attendee.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  date: Date;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 500, nullable: true })
  flyerUrl: string;

  @Column({ type: 'int', default: 100 })
  maxCapacity: number;

  @Column({ length: 10, default: 'BASE' })
  ticketPrefix: string;

  @OneToMany(() => Attendee, (attendee) => attendee.event)
  attendees: Attendee[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
