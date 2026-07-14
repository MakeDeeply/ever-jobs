import { Module } from '@nestjs/common';
import { InsitroService } from './insitro.service';

@Module({ providers: [InsitroService], exports: [InsitroService] })
export class InsitroModule {}
