import { Module } from '@nestjs/common';
import { OSAROService } from './osaro.service';

@Module({ providers: [OSAROService], exports: [OSAROService] })
export class OSAROModule {}
