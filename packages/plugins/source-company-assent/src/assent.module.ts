import { Module } from '@nestjs/common';
import { AssentService } from './assent.service';

@Module({ providers: [AssentService], exports: [AssentService] })
export class AssentModule {}
