import { Module } from '@nestjs/common';
import { AbercrombieFitchCoService } from './abercrombiefitchco.service';

@Module({ providers: [AbercrombieFitchCoService], exports: [AbercrombieFitchCoService] })
export class AbercrombieFitchCoModule {}
