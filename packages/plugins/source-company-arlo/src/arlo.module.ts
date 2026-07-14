import { Module } from '@nestjs/common';
import { ArloService } from './arlo.service';

@Module({ providers: [ArloService], exports: [ArloService] })
export class ArloModule {}
