import { Module } from '@nestjs/common';
import { SalvoHealthService } from './salvohealth.service';

@Module({ providers: [SalvoHealthService], exports: [SalvoHealthService] })
export class SalvoHealthModule {}
