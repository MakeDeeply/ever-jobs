import { Module } from '@nestjs/common';
import { PeddlerService } from './peddler.service';

@Module({ providers: [PeddlerService], exports: [PeddlerService] })
export class PeddlerModule {}
