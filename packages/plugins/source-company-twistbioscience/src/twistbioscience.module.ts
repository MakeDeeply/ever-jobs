import { Module } from '@nestjs/common';
import { TwistBioscienceService } from './twistbioscience.service';

@Module({ providers: [TwistBioscienceService], exports: [TwistBioscienceService] })
export class TwistBioscienceModule {}
