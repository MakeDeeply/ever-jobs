import { Module } from '@nestjs/common';
import { ExplodingKittensService } from './explodingkittens.service';

@Module({ providers: [ExplodingKittensService], exports: [ExplodingKittensService] })
export class ExplodingKittensModule {}
