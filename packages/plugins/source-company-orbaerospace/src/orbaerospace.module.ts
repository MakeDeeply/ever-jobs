import { Module } from '@nestjs/common';
import { OrbAerospaceService } from './orbaerospace.service';

@Module({ providers: [OrbAerospaceService], exports: [OrbAerospaceService] })
export class OrbAerospaceModule {}
