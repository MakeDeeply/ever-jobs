import { Module } from '@nestjs/common';
import { KHAerospaceService } from './khaerospace.service';

@Module({ providers: [KHAerospaceService], exports: [KHAerospaceService] })
export class KHAerospaceModule {}
