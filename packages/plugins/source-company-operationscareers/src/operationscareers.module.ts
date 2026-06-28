import { Module } from '@nestjs/common';
import { VeoService } from './operationscareers.service';

@Module({ providers: [VeoService], exports: [VeoService] })
export class VeoModule {}
