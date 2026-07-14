import { Module } from '@nestjs/common';
import { EducationalConnectionsService } from './educationalconnections.service';

@Module({ providers: [EducationalConnectionsService], exports: [EducationalConnectionsService] })
export class EducationalConnectionsModule {}
