import { Module } from '@nestjs/common';
import { InfojiniService } from './infojini.service';

@Module({ providers: [InfojiniService], exports: [InfojiniService] })
export class InfojiniModule {}
