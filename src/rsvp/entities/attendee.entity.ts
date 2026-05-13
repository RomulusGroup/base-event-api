import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ length: 255, nullable: true })
  plusOneName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
