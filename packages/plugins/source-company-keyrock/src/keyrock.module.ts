import { Module } from '@nestjs/common';
import { KeyrockService } from './keyrock.service';

@Module({ providers: [KeyrockService], exports: [KeyrockService] })
export class KeyrockModule {}
