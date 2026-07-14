import { Module } from '@nestjs/common';
import { VerticalAerospaceService } from './verticalaerospace.service';

@Module({ providers: [VerticalAerospaceService], exports: [VerticalAerospaceService] })
export class VerticalAerospaceModule {}
