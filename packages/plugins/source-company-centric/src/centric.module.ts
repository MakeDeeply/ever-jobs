import { Module } from '@nestjs/common';
import { CentricService } from './centric.service';

@Module({ providers: [CentricService], exports: [CentricService] })
export class CentricModule {}
