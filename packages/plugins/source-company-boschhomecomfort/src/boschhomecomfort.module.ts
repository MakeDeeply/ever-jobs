import { Module } from '@nestjs/common';
import { BoschHomeComfortService } from './boschhomecomfort.service';

@Module({ providers: [BoschHomeComfortService], exports: [BoschHomeComfortService] })
export class BoschHomeComfortModule {}
