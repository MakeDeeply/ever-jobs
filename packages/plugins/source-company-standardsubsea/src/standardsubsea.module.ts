import { Module } from '@nestjs/common';
import { StandardSubseaService } from './standardsubsea.service';

@Module({ providers: [StandardSubseaService], exports: [StandardSubseaService] })
export class StandardSubseaModule {}
