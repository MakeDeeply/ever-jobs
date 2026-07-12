import { Module } from '@nestjs/common';
import { TrialLibraryService } from './triallibrary.service';

@Module({ providers: [TrialLibraryService], exports: [TrialLibraryService] })
export class TrialLibraryModule {}
