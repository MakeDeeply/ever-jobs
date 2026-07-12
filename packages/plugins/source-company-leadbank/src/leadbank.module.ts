import { Module } from '@nestjs/common';
import { LeadBankService } from './leadbank.service';

@Module({ providers: [LeadBankService], exports: [LeadBankService] })
export class LeadBankModule {}
