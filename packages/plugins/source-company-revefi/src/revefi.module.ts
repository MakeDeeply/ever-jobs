import { Module } from '@nestjs/common';
import { RevefiService } from './revefi.service';

@Module({ providers: [RevefiService], exports: [RevefiService] })
export class RevefiModule {}
