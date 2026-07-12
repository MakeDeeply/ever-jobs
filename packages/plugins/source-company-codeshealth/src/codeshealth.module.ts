import { Module } from '@nestjs/common';
import { CodesHealthService } from './codeshealth.service';

@Module({ providers: [CodesHealthService], exports: [CodesHealthService] })
export class CodesHealthModule {}
