import { Module } from '@nestjs/common';
import { NeonAerospaceService } from './neonaerospace.service';

@Module({ providers: [NeonAerospaceService], exports: [NeonAerospaceService] })
export class NeonAerospaceModule {}
