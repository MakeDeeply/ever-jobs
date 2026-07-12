import { Module } from '@nestjs/common';
import { FlorynService } from './floryn.service';

@Module({ providers: [FlorynService], exports: [FlorynService] })
export class FlorynModule {}
