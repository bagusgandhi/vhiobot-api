import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('monthly_analytics')
export class MonthlyAnalytics extends BaseEntity {
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
