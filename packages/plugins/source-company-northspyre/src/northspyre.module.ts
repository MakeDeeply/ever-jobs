import { Module } from '@nestjs/common';
import { NorthspyreService } from './northspyre.service';

@Module({ providers: [NorthspyreService], exports: [NorthspyreService] })
export class NorthspyreModule {}
