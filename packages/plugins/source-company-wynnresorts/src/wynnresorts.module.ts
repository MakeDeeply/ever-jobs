import { Module } from '@nestjs/common';
import { WynnResortsService } from './wynnresorts.service';

@Module({ providers: [WynnResortsService], exports: [WynnResortsService] })
export class WynnResortsModule {}
