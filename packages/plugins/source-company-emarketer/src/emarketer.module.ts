import { Module } from '@nestjs/common';
import { EMARKETERService } from './emarketer.service';

@Module({ providers: [EMARKETERService], exports: [EMARKETERService] })
export class EMARKETERModule {}
