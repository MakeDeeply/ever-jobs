import { Module } from '@nestjs/common';
import { AuguryService } from './augury.service';

@Module({ providers: [AuguryService], exports: [AuguryService] })
export class AuguryModule {}
