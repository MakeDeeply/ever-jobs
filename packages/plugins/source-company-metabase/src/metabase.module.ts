import { Module } from '@nestjs/common';
import { MetabaseService } from './metabase.service';

@Module({ providers: [MetabaseService], exports: [MetabaseService] })
export class MetabaseModule {}
