import { Module } from '@nestjs/common';
import { ModernizeHomeServicesService } from './modernize.service';

@Module({ providers: [ModernizeHomeServicesService], exports: [ModernizeHomeServicesService] })
export class ModernizeHomeServicesModule {}
