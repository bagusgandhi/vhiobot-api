import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Intent } from '../entites/intent.entity';

@Injectable()
export class IntentRepository extends Repository<Intent> {
  constructor(private readonly dataSource: DataSource) {
    super(Intent, dataSource.createEntityManager());
  }

  async findByIntentId(uuid: string) {
    try {
      const query = this.createQueryBuilder('intent')
      // .leftJoinAndSelect('intent.trainingPhrases', 'trainingPhrases')
      // .leftJoinAndSelect('intent.responseTexts', 'responseTexts');
      query.where('intent.uuid = :uuid', { uuid });
      const intent = await query.getOne();
  
      if (!intent) {
        throw new NotFoundException(`Intent with ID ${uuid} not found`);
      }
  
      return intent;
    } catch (error) {
      
    }

  }

  async queryPaginate(page: number, limit: number) {
    const query = this.createQueryBuilder('intent')
      .orderBy('intent.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [results, total] = await query.getManyAndCount();

    return {
      page,
      total,
      results,
    };
  }
}

