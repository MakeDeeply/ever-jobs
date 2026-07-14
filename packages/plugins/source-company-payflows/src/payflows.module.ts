import { Module } from '@nestjs/common';
import { PayflowsService } from './payflows.service';

@Module({ providers: [PayflowsService], exports: [PayflowsService] })
export class PayflowsModule {}
