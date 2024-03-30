import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { MessageType } from '../interface/message.interface';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('chat')
export class Chat extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column('jsonb', { nullable: true })
    message: MessageType[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
    deletedAt: Date;

    @OneToOne(() => User)
    @JoinColumn()
    user: User
}