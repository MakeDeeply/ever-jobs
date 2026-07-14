import { Module } from '@nestjs/common';
import { VenusAerospaceService } from './venusaero.service';

@Module({ providers: [VenusAerospaceService], exports: [VenusAerospaceService] })
export class VenusAerospaceModule {}
