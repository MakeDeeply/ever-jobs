import { Module } from '@nestjs/common';
import { AdaptiveSecurityService } from './adaptivesecurity.service';

@Module({ providers: [AdaptiveSecurityService], exports: [AdaptiveSecurityService] })
export class AdaptiveSecurityModule {}
