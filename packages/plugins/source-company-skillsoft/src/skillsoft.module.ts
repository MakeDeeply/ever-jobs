import { Module } from '@nestjs/common';
import { SkillsoftService } from './skillsoft.service';

@Module({ providers: [SkillsoftService], exports: [SkillsoftService] })
export class SkillsoftModule {}
