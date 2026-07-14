import { Module } from '@nestjs/common';
import { SimviaService } from './simvia.service';

@Module({ providers: [SimviaService], exports: [SimviaService] })
export class SimviaModule {}
