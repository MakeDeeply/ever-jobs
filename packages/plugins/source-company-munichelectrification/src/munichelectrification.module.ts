import { Module } from '@nestjs/common';
import { MunichElectrificationService } from './munichelectrification.service';

@Module({ providers: [MunichElectrificationService], exports: [MunichElectrificationService] })
export class MunichElectrificationModule {}
