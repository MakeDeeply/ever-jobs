import { Module } from '@nestjs/common';
import { KeplerCommunicationsService } from './kepler.service';

@Module({ providers: [KeplerCommunicationsService], exports: [KeplerCommunicationsService] })
export class KeplerCommunicationsModule {}
