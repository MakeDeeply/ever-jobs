import { Module } from '@nestjs/common';
import { ArteliaService } from './artelia.service';

@Module({ providers: [ArteliaService], exports: [ArteliaService] })
export class ArteliaModule {}
