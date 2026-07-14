import { Module } from '@nestjs/common';
import { CyngnService } from './cyngn.service';

@Module({ providers: [CyngnService], exports: [CyngnService] })
export class CyngnModule {}
