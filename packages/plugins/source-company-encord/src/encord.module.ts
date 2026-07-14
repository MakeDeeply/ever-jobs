import { Module } from '@nestjs/common';
import { EncordService } from './encord.service';

@Module({ providers: [EncordService], exports: [EncordService] })
export class EncordModule {}
