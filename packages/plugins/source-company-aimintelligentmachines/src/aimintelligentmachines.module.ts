import { Module } from '@nestjs/common';
import { AIMIntelligentMachinesService } from './aimintelligentmachines.service';

@Module({ providers: [AIMIntelligentMachinesService], exports: [AIMIntelligentMachinesService] })
export class AIMIntelligentMachinesModule {}
