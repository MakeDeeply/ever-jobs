import { Module } from '@nestjs/common';
import { LogicGateService } from './logicgate.service';

@Module({ providers: [LogicGateService], exports: [LogicGateService] })
export class LogicGateModule {}
