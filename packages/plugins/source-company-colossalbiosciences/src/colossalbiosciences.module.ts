import { Module } from '@nestjs/common';
import { ColossalBiosciencesService } from './colossalbiosciences.service';

@Module({ providers: [ColossalBiosciencesService], exports: [ColossalBiosciencesService] })
export class ColossalBiosciencesModule {}
