import { Module } from '@nestjs/common';
import { AeroVectService } from './aerovect.service';

@Module({ providers: [AeroVectService], exports: [AeroVectService] })
export class AeroVectModule {}
