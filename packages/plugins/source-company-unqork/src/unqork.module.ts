import { Module } from '@nestjs/common';
import { UnqorkService } from './unqork.service';

@Module({ providers: [UnqorkService], exports: [UnqorkService] })
export class UnqorkModule {}
