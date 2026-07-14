import { Module } from '@nestjs/common';
import { ExpeditorsService } from './expeditors.service';

@Module({ providers: [ExpeditorsService], exports: [ExpeditorsService] })
export class ExpeditorsModule {}
