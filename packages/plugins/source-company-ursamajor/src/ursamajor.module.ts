import { Module } from '@nestjs/common';
import { UrsaMajorService } from './ursamajor.service';

@Module({ providers: [UrsaMajorService], exports: [UrsaMajorService] })
export class UrsaMajorModule {}
