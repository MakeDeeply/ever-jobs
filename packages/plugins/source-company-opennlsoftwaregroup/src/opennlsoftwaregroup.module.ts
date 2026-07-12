import { Module } from '@nestjs/common';
import { OPENNlSoftwareGroupService } from './opennlsoftwaregroup.service';

@Module({ providers: [OPENNlSoftwareGroupService], exports: [OPENNlSoftwareGroupService] })
export class OPENNlSoftwareGroupModule {}
