import { Module } from '@nestjs/common';
import { ALTENService } from './alten.service';

@Module({ providers: [ALTENService], exports: [ALTENService] })
export class ALTENModule {}
