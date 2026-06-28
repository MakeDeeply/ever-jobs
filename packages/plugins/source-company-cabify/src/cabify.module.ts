import { Module } from '@nestjs/common';
import { CabifyService } from './cabify.service';

@Module({ providers: [CabifyService], exports: [CabifyService] })
export class CabifyModule {}
