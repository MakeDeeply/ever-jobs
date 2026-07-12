import { Module } from '@nestjs/common';
import { OpenEvidenceService } from './openevidence.service';

@Module({ providers: [OpenEvidenceService], exports: [OpenEvidenceService] })
export class OpenEvidenceModule {}
