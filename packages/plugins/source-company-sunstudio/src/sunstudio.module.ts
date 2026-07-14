import { Module } from '@nestjs/common';
import { SunStudioService } from './sunstudio.service';

@Module({ providers: [SunStudioService], exports: [SunStudioService] })
export class SunStudioModule {}
