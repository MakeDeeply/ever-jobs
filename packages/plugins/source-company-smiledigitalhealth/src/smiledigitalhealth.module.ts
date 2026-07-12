import { Module } from '@nestjs/common';
import { SmileDigitalHealthService } from './smiledigitalhealth.service';

@Module({ providers: [SmileDigitalHealthService], exports: [SmileDigitalHealthService] })
export class SmileDigitalHealthModule {}
