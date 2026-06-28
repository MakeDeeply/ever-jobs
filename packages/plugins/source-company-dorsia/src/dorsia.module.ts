import { Module } from '@nestjs/common';
import { DorsiaService } from './dorsia.service';

@Module({ providers: [DorsiaService], exports: [DorsiaService] })
export class DorsiaModule {}
