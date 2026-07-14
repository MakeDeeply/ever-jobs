import { Module } from '@nestjs/common';
import { MiroService } from './miro.service';

@Module({ providers: [MiroService], exports: [MiroService] })
export class MiroModule {}
