import { Module } from '@nestjs/common';
import { CareMessageService } from './caremessage.service';

@Module({ providers: [CareMessageService], exports: [CareMessageService] })
export class CareMessageModule {}
