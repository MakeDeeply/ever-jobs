import { Module } from '@nestjs/common';
import { OPLabsService } from './oplabs.service';

@Module({ providers: [OPLabsService], exports: [OPLabsService] })
export class OPLabsModule {}
