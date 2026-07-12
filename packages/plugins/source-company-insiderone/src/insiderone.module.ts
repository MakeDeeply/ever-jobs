import { Module } from '@nestjs/common';
import { InsiderService } from './insiderone.service';

@Module({ providers: [InsiderService], exports: [InsiderService] })
export class InsiderModule {}
