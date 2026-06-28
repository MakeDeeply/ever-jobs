import { Module } from '@nestjs/common';
import { InstaworkService } from './instawork.service';

@Module({ providers: [InstaworkService], exports: [InstaworkService] })
export class InstaworkModule {}
