import { Module } from '@nestjs/common';
import { AsimovService } from './asimov.service';

@Module({ providers: [AsimovService], exports: [AsimovService] })
export class AsimovModule {}
