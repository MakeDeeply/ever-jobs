import { Module } from '@nestjs/common';
import { WizService } from './wizinc.service';

@Module({ providers: [WizService], exports: [WizService] })
export class WizModule {}
