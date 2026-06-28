import { Module } from '@nestjs/common';
import { PayNearMeService } from './paynearmeinc.service';

@Module({ providers: [PayNearMeService], exports: [PayNearMeService] })
export class PayNearMeModule {}
