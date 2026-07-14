import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Database disconnected');
  }

  /**
   * Helper method for soft deletes
   */
  async softDelete(model: string, id: string) {
    return this[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Clean up all connections
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter(
        (key) => typeof key === 'string' && key[0] !== '_',
      );
      
      return Promise.all(
        models.map((modelKey) => {
          if (this[modelKey as string]?.deleteMany) {
            return this[modelKey as string].deleteMany();
          }
        }),
      );
    }
  }
}
