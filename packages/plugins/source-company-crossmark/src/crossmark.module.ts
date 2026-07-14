import { Module } from '@nestjs/common';
import { CROSSMARKService } from './crossmark.service';

@Module({ providers: [CROSSMARKService], exports: [CROSSMARKService] })
export class CROSSMARKModule {}
