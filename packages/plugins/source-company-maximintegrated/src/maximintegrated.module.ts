import { Module } from '@nestjs/common';
import { MaximIntegratedService } from './maximintegrated.service';

@Module({ providers: [MaximIntegratedService], exports: [MaximIntegratedService] })
export class MaximIntegratedModule {}
