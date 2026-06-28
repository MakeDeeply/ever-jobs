import { Module } from '@nestjs/common';
import { WildlifeStudiosService } from './wildlifestudios.service';

@Module({ providers: [WildlifeStudiosService], exports: [WildlifeStudiosService] })
export class WildlifeStudiosModule {}
