import { Module } from '@nestjs/common';
import { MasdarService } from './masdar.service';

@Module({ providers: [MasdarService], exports: [MasdarService] })
export class MasdarModule {}
