import { Module } from '@nestjs/common';
import { GlobalLendingServicesService } from './glsllc.service';

@Module({ providers: [GlobalLendingServicesService], exports: [GlobalLendingServicesService] })
export class GlobalLendingServicesModule {}
