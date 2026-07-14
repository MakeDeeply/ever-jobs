import { Module } from '@nestjs/common';
import { ParamountService } from './paramount.service';

@Module({ providers: [ParamountService], exports: [ParamountService] })
export class ParamountModule {}
