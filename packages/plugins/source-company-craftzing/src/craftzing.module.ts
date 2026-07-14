import { Module } from '@nestjs/common';
import { CraftzingService } from './craftzing.service';

@Module({ providers: [CraftzingService], exports: [CraftzingService] })
export class CraftzingModule {}
