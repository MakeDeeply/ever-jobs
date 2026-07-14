import { Module } from '@nestjs/common';
import { WorldWildlifeFundService } from './worldwildlifefund.service';

@Module({ providers: [WorldWildlifeFundService], exports: [WorldWildlifeFundService] })
export class WorldWildlifeFundModule {}
