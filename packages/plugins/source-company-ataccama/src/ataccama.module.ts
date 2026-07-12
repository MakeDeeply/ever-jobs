import { Module } from '@nestjs/common';
import { AtaccamaService } from './ataccama.service';

@Module({ providers: [AtaccamaService], exports: [AtaccamaService] })
export class AtaccamaModule {}
