import { Module } from '@nestjs/common';
import { AppliedIntuitionService } from './appliedintuition.service';

@Module({ providers: [AppliedIntuitionService], exports: [AppliedIntuitionService] })
export class AppliedIntuitionModule {}
