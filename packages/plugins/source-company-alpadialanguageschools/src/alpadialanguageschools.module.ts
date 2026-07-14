import { Module } from '@nestjs/common';
import { AlpadiaLanguageSchoolsService } from './alpadialanguageschools.service';

@Module({ providers: [AlpadiaLanguageSchoolsService], exports: [AlpadiaLanguageSchoolsService] })
export class AlpadiaLanguageSchoolsModule {}
