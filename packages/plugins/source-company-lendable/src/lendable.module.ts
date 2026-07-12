import { Module } from '@nestjs/common';
import { LendableService } from './lendable.service';

@Module({ providers: [LendableService], exports: [LendableService] })
export class LendableModule {}
