import { Module } from '@nestjs/common';
import { ClickUpService } from './clickup.service';

@Module({ providers: [ClickUpService], exports: [ClickUpService] })
export class ClickUpModule {}
