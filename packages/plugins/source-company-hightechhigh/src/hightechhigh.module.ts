import { Module } from '@nestjs/common';
import { HighTechHighService } from './hightechhigh.service';

@Module({ providers: [HighTechHighService], exports: [HighTechHighService] })
export class HighTechHighModule {}
