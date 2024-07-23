import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('daily_analytics')
export class DailyAnalytics extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column('int')
  activeUser: number;

  @Column('int')
  conversation: number;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
