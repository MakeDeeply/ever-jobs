import { Module } from '@nestjs/common';
import { TexasHealthResourcesService } from './texashealthresources.service';

@Module({ providers: [TexasHealthResourcesService], exports: [TexasHealthResourcesService] })
export class TexasHealthResourcesModule {}
