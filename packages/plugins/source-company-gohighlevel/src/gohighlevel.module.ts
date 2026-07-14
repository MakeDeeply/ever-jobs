import { Module } from '@nestjs/common';
import { HighLevelService } from './gohighlevel.service';

@Module({ providers: [HighLevelService], exports: [HighLevelService] })
export class HighLevelModule {}
