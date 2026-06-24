import { Module } from '@nestjs/common';
import { FormBioService } from './formbio.service';

@Module({ providers: [FormBioService], exports: [FormBioService] })
export class FormBioModule {}
