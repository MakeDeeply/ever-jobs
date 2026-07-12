import { Module } from '@nestjs/common';
import { VevoService } from './vevo.service';

@Module({ providers: [VevoService], exports: [VevoService] })
export class VevoModule {}
