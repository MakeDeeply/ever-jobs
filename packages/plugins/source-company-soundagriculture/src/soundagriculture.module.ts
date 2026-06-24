import { Module } from '@nestjs/common';
import { SoundAgricultureService } from './soundagriculture.service';

@Module({ providers: [SoundAgricultureService], exports: [SoundAgricultureService] })
export class SoundAgricultureModule {}
