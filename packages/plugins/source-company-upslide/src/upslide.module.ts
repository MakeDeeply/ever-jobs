import { Module } from '@nestjs/common';
import { UpSlideService } from './upslide.service';

@Module({ providers: [UpSlideService], exports: [UpSlideService] })
export class UpSlideModule {}
