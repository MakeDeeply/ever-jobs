import { Module } from '@nestjs/common';
import { TakeTwoInteractiveService } from './taketwo.service';

@Module({ providers: [TakeTwoInteractiveService], exports: [TakeTwoInteractiveService] })
export class TakeTwoInteractiveModule {}
