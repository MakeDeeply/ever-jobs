import { Module } from '@nestjs/common';
import { DutchieService } from './thedutchie.service';

@Module({ providers: [DutchieService], exports: [DutchieService] })
export class DutchieModule {}
