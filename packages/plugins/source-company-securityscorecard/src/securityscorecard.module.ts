import { Module } from '@nestjs/common';
import { SecurityScorecardService } from './securityscorecard.service';

@Module({ providers: [SecurityScorecardService], exports: [SecurityScorecardService] })
export class SecurityScorecardModule {}
