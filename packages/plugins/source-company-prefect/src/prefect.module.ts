import { Module } from '@nestjs/common';
import { PrefectService } from './prefect.service';

@Module({ providers: [PrefectService], exports: [PrefectService] })
export class PrefectModule {}
