import { Module } from '@nestjs/common';
import { CypressCreekRenewablesService } from './cypresscreekrenewables.service';

@Module({ providers: [CypressCreekRenewablesService], exports: [CypressCreekRenewablesService] })
export class CypressCreekRenewablesModule {}
