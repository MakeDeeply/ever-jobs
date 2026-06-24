import { Module } from '@nestjs/common';
import { HighRadiusService } from './highradius.service';

@Module({ providers: [HighRadiusService], exports: [HighRadiusService] })
export class HighRadiusModule {}
