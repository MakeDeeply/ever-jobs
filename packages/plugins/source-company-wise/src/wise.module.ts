import { Module } from '@nestjs/common';
import { WiseService } from './wise.service';

@Module({ providers: [WiseService], exports: [WiseService] })
export class WiseModule {}
