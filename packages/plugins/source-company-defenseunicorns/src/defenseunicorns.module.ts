import { Module } from '@nestjs/common';
import { DefenseUnicornsService } from './defenseunicorns.service';

@Module({ providers: [DefenseUnicornsService], exports: [DefenseUnicornsService] })
export class DefenseUnicornsModule {}
