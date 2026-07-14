import { Module } from '@nestjs/common';
import { MatiaService } from './matia.service';

@Module({ providers: [MatiaService], exports: [MatiaService] })
export class MatiaModule {}
