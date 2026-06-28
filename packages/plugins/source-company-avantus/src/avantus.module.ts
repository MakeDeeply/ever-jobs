import { Module } from '@nestjs/common';
import { AvantusService } from './avantus.service';

@Module({ providers: [AvantusService], exports: [AvantusService] })
export class AvantusModule {}
