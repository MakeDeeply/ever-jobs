import { Module } from '@nestjs/common';
import { SemgrepService } from './semgrep.service';

@Module({ providers: [SemgrepService], exports: [SemgrepService] })
export class SemgrepModule {}
