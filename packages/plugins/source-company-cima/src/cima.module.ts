import { Module } from '@nestjs/common';
import { CIMAService } from './cima.service';

@Module({ providers: [CIMAService], exports: [CIMAService] })
export class CIMAModule {}
