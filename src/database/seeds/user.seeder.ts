import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Role } from 'src/modules/auth/enum/roles.enum';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');

    const repository = dataSource.getRepository(User);
    const salt = await bcrypt.genSalt();

    await repository.insert({
      email: 'admin@vhiobot.io',
      name: 'Admin',
      provider: 'custom',
      role: Role.Administrator,
      salt,
      password: await bcrypt.hash('pass123!@#', salt),
    });
  }
}
