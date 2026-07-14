import { Module } from '@nestjs/common';
import { FINNService } from './finn.service';

@Module({ providers: [FINNService], exports: [FINNService] })
export class FINNModule {}
