import { Module } from '@nestjs/common';
import { BrueggerSBagelsService } from './brueggersbagels.service';

@Module({ providers: [BrueggerSBagelsService], exports: [BrueggerSBagelsService] })
export class BrueggerSBagelsModule {}
