import { Module } from '@nestjs/common';
import { OIGlassService } from './oiglass.service';

@Module({ providers: [OIGlassService], exports: [OIGlassService] })
export class OIGlassModule {}
