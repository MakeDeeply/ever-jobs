import { Module } from '@nestjs/common';
import { HappyCoService } from './happyco.service';

@Module({ providers: [HappyCoService], exports: [HappyCoService] })
export class HappyCoModule {}
