import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('intent')
export class Intent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  displayName: string;

  @Column()
  dfIntentId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true, name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @Column('jsonb')
  trainingPhrases: string[]; // or an array of objects, if needed

  @Column('jsonb')
  responseTexts: string[]; // or an array of objects, if needed

  @Column('jsonb')
  input_context: string[]; // or an array of objects, if needed

  @Column('jsonb')
  output_context: string[]; // or an array of objects, if needed
}
