import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private readonly dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async findById(uuid: string) {
        const query = this.createQueryBuilder('user')
        query.andWhere('user.uuid = :uuid', { uuid })
        const user = await query.getOne();
        return user;
    }

    async findByEmail(email: string) {
        const query = this.createQueryBuilder('user')
        query.andWhere('user.email = :email', { email })
        const user = await query.getOne();
        return user;
    }

    async queryPaginate(page: number, limit: number) {
        const query = this.createQueryBuilder('user')
            .orderBy('user.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [results, total] = await query.getManyAndCount();

        return {
            page,
            total,
            results
        }
    }
}