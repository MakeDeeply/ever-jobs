import { Module } from '@nestjs/common';
import { HomewardService } from './homeward.service';

@Module({ providers: [HomewardService], exports: [HomewardService] })
export class HomewardModule {}
