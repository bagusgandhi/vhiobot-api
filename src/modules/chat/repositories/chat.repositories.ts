import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Chat } from "../entities/chat.entity";

@Injectable()
export class ChatRepository extends Repository<Chat> {
    constructor(private readonly dataSource: DataSource) {
        super(Chat, dataSource.createEntityManager());
    }

    async findByUserId(uuid: string) {
        const query = this.createQueryBuilder('chat')
        query.innerJoinAndSelect('chat.user', 'user')
        query.where('user.uuid = :uuid', { uuid })
        const chat = await query.getOne();
        return chat;
    }

    async queryPaginate(page: number, limit: number) {
        const query = this.createQueryBuilder('chat')
            .orderBy('chat.created_at', 'DESC')
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