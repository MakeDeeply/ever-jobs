import { Module } from '@nestjs/common';
import { FormicService } from './formic.service';

@Module({ providers: [FormicService], exports: [FormicService] })
export class FormicModule {}
