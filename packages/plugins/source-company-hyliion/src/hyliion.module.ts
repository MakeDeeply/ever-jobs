import { Module } from '@nestjs/common';
import { HyliionService } from './hyliion.service';

@Module({ providers: [HyliionService], exports: [HyliionService] })
export class HyliionModule {}
