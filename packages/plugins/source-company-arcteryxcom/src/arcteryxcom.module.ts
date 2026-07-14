import { Module } from '@nestjs/common';
import { ArcTeryxService } from './arcteryxcom.service';

@Module({ providers: [ArcTeryxService], exports: [ArcTeryxService] })
export class ArcTeryxModule {}
