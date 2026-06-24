import { Module } from '@nestjs/common';
import { NautoService } from './nauto.service';

@Module({ providers: [NautoService], exports: [NautoService] })
export class NautoModule {}
