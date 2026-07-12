import { Module } from '@nestjs/common';
import { ModalService } from './modal.service';

@Module({ providers: [ModalService], exports: [ModalService] })
export class ModalModule {}
