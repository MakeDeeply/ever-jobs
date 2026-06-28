import { Module } from '@nestjs/common';
import { TEGNAService } from './tegnainc.service';

@Module({ providers: [TEGNAService], exports: [TEGNAService] })
export class TEGNAModule {}
