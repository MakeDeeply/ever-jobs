import { Module } from '@nestjs/common';
import { NatixisInPortugalService } from './natixisinportugal.service';

@Module({ providers: [NatixisInPortugalService], exports: [NatixisInPortugalService] })
export class NatixisInPortugalModule {}
