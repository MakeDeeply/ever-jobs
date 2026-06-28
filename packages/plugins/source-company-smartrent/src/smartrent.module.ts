import { Module } from '@nestjs/common';
import { SmartRentService } from './smartrent.service';

@Module({ providers: [SmartRentService], exports: [SmartRentService] })
export class SmartRentModule {}
