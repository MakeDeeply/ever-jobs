import { Module } from '@nestjs/common';
import { LambdaService } from './lambda.service';

@Module({ providers: [LambdaService], exports: [LambdaService] })
export class LambdaModule {}
