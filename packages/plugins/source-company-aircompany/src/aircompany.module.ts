import { Module } from '@nestjs/common';
import { AIRCOMPANYService } from './aircompany.service';

@Module({ providers: [AIRCOMPANYService], exports: [AIRCOMPANYService] })
export class AIRCOMPANYModule {}
