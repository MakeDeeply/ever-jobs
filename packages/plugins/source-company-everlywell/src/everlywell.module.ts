import { Module } from '@nestjs/common';
import { EverlywellService } from './everlywell.service';

@Module({ providers: [EverlywellService], exports: [EverlywellService] })
export class EverlywellModule {}
