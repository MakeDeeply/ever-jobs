import { Module } from '@nestjs/common';
import { AssuredService } from './assured.service';

@Module({ providers: [AssuredService], exports: [AssuredService] })
export class AssuredModule {}
