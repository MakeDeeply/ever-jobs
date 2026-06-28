import { Module } from '@nestjs/common';
import { TheTradeDeskService } from './thetradedesk.service';

@Module({ providers: [TheTradeDeskService], exports: [TheTradeDeskService] })
export class TheTradeDeskModule {}
