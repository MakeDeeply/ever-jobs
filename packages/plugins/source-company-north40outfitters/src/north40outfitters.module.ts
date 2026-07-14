import { Module } from '@nestjs/common';
import { North40OutfittersService } from './north40outfitters.service';

@Module({ providers: [North40OutfittersService], exports: [North40OutfittersService] })
export class North40OutfittersModule {}
