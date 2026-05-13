import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('attendees')
export class Attendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 50 })
  phoneNumber: string;

  @Column({ type: 'boolean' })
  isAttending: boolean;

  @Column({ type: 'boolean', default: false })
  bringingPlusOne: boolean;

  @Column({ type: 'int', default: 0 })
  guestCount: number;

  @Column({ length: 255, nullable: true })
  plusOneName: string;

  @Column({ unique: true, length: 100, nullable: true })
  ticketNumber: string;

  @Column({ type: 'boolean', default: false })
  checkedIn: boolean;

  @ManyToOne(() => Event, (event) => event.attendees)
  event: Event;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
