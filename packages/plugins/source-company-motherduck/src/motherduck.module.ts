import { Module } from '@nestjs/common';
import { MotherDuckService } from './motherduck.service';

@Module({ providers: [MotherDuckService], exports: [MotherDuckService] })
export class MotherDuckModule {}
