import { Module } from '@nestjs/common';
import { ISEEService } from './isee.service';

@Module({ providers: [ISEEService], exports: [ISEEService] })
export class ISEEModule {}
