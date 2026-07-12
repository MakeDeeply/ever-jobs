import { Module } from '@nestjs/common';
import { TheBotCompanyService } from './thebotcompany.service';

@Module({ providers: [TheBotCompanyService], exports: [TheBotCompanyService] })
export class TheBotCompanyModule {}
