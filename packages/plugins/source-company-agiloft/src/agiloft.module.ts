import { Module } from '@nestjs/common';
import { AgiloftService } from './agiloft.service';

@Module({ providers: [AgiloftService], exports: [AgiloftService] })
export class AgiloftModule {}
