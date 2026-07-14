import { Module } from '@nestjs/common';
import { LiveNationEntertainmentService } from './livenationentertainment.service';

@Module({ providers: [LiveNationEntertainmentService], exports: [LiveNationEntertainmentService] })
export class LiveNationEntertainmentModule {}
