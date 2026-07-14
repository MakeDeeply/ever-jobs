import { Module } from '@nestjs/common';
import { ETalentService } from './etalent.service';

@Module({ providers: [ETalentService], exports: [ETalentService] })
export class ETalentModule {}
