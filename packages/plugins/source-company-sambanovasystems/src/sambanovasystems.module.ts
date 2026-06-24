import { Module } from '@nestjs/common';
import { SambaNovaSystemsService } from './sambanovasystems.service';

@Module({ providers: [SambaNovaSystemsService], exports: [SambaNovaSystemsService] })
export class SambaNovaSystemsModule {}
