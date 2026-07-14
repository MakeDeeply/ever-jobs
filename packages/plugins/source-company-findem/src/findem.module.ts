import { Module } from '@nestjs/common';
import { FindemService } from './findem.service';

@Module({ providers: [FindemService], exports: [FindemService] })
export class FindemModule {}
