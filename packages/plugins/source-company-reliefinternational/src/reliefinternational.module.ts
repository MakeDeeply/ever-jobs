import { Module } from '@nestjs/common';
import { ReliefInternationalService } from './reliefinternational.service';

@Module({ providers: [ReliefInternationalService], exports: [ReliefInternationalService] })
export class ReliefInternationalModule {}
