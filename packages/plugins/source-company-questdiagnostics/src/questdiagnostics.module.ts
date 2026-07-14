import { Module } from '@nestjs/common';
import { QuestDiagnosticsService } from './questdiagnostics.service';

@Module({ providers: [QuestDiagnosticsService], exports: [QuestDiagnosticsService] })
export class QuestDiagnosticsModule {}
