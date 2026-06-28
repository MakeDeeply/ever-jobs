import { Module } from '@nestjs/common';
import { CognitivService } from './cognitiv.service';

@Module({ providers: [CognitivService], exports: [CognitivService] })
export class CognitivModule {}
