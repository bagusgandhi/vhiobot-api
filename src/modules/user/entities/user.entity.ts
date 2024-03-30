import { Role } from 'src/modules/auth/enum/roles.enum';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

@Entity('user')
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    salt: string;

    @Column({ nullable: true })
    password: string;

    @Column()
    provider: string;

    @Column({ type: 'enum', enum: Role, default: Role.Customer })
    role: Role;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
    deletedAt: Date;
}