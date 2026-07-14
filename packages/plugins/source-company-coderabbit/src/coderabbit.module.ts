import { Module } from '@nestjs/common';
import { CodeRabbitService } from './coderabbit.service';

@Module({ providers: [CodeRabbitService], exports: [CodeRabbitService] })
export class CodeRabbitModule {}
