import { Module } from '@nestjs/common';
import { MinorInternationalService } from './minorinternational.service';

@Module({ providers: [MinorInternationalService], exports: [MinorInternationalService] })
export class MinorInternationalModule {}
