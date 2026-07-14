import { Module } from '@nestjs/common';
import { WEBBTradersService } from './webbtraders.service';

@Module({ providers: [WEBBTradersService], exports: [WEBBTradersService] })
export class WEBBTradersModule {}
