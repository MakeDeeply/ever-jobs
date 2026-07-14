import { Module } from '@nestjs/common';
import { ZenithTalentService } from './zenithtalent.service';

@Module({ providers: [ZenithTalentService], exports: [ZenithTalentService] })
export class ZenithTalentModule {}
