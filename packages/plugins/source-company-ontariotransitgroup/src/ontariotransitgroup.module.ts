import { Module } from '@nestjs/common';
import { OntarioTransitGroupService } from './ontariotransitgroup.service';

@Module({ providers: [OntarioTransitGroupService], exports: [OntarioTransitGroupService] })
export class OntarioTransitGroupModule {}
