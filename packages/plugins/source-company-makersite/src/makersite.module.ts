import { Module } from '@nestjs/common';
import { MakersiteService } from './makersite.service';

@Module({ providers: [MakersiteService], exports: [MakersiteService] })
export class MakersiteModule {}
