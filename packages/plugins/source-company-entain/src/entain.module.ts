import { Module } from '@nestjs/common';
import { EntainService } from './entain.service';

@Module({ providers: [EntainService], exports: [EntainService] })
export class EntainModule {}
