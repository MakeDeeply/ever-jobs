import { Module } from '@nestjs/common';
import { PostHogService } from './posthog.service';

@Module({ providers: [PostHogService], exports: [PostHogService] })
export class PostHogModule {}
