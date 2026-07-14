import { Module } from '@nestjs/common';
import { OxfamAmericaService } from './oxfamamerica.service';

@Module({ providers: [OxfamAmericaService], exports: [OxfamAmericaService] })
export class OxfamAmericaModule {}
