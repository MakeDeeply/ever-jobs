import { Module } from '@nestjs/common';
import { NotableService } from './notable.service';

@Module({ providers: [NotableService], exports: [NotableService] })
export class NotableModule {}
