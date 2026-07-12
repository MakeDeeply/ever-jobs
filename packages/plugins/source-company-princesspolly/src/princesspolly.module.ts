import { Module } from '@nestjs/common';
import { PrincessPollyService } from './princesspolly.service';

@Module({ providers: [PrincessPollyService], exports: [PrincessPollyService] })
export class PrincessPollyModule {}
