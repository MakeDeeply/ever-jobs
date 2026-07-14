import { Module } from '@nestjs/common';
import { RaisingCaneSService } from './raisingcanes.service';

@Module({ providers: [RaisingCaneSService], exports: [RaisingCaneSService] })
export class RaisingCaneSModule {}
