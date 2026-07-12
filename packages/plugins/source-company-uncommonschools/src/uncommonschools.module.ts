import { Module } from '@nestjs/common';
import { UncommonSchoolsService } from './uncommonschools.service';

@Module({ providers: [UncommonSchoolsService], exports: [UncommonSchoolsService] })
export class UncommonSchoolsModule {}
