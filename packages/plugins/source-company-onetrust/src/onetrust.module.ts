import { Module } from '@nestjs/common';
import { OneTrustService } from './onetrust.service';

@Module({ providers: [OneTrustService], exports: [OneTrustService] })
export class OneTrustModule {}
