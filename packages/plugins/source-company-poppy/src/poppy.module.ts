import { Module } from '@nestjs/common';
import { PoppyService } from './poppy.service';

@Module({ providers: [PoppyService], exports: [PoppyService] })
export class PoppyModule {}
