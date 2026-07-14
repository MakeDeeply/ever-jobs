import { Module } from '@nestjs/common';
import { SierraService } from './sierra.service';

@Module({ providers: [SierraService], exports: [SierraService] })
export class SierraModule {}
