import { Module } from '@nestjs/common';
import { OfficeDepotService } from './officedepot.service';

@Module({ providers: [OfficeDepotService], exports: [OfficeDepotService] })
export class OfficeDepotModule {}
