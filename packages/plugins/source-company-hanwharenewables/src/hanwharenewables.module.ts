import { Module } from '@nestjs/common';
import { HanwhaRenewablesService } from './hanwharenewables.service';

@Module({ providers: [HanwhaRenewablesService], exports: [HanwhaRenewablesService] })
export class HanwhaRenewablesModule {}
