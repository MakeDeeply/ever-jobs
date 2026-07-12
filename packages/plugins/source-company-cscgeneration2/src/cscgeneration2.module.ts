import { Module } from '@nestjs/common';
import { CSCGenerationService } from './cscgeneration2.service';

@Module({ providers: [CSCGenerationService], exports: [CSCGenerationService] })
export class CSCGenerationModule {}
