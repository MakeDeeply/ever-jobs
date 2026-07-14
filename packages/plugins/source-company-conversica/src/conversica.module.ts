import { Module } from '@nestjs/common';
import { ConversicaService } from './conversica.service';

@Module({ providers: [ConversicaService], exports: [ConversicaService] })
export class ConversicaModule {}
