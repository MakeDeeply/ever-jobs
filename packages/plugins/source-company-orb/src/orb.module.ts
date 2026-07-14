import { Module } from '@nestjs/common';
import { OrbService } from './orb.service';

@Module({ providers: [OrbService], exports: [OrbService] })
export class OrbModule {}
