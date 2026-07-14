import { Module } from '@nestjs/common';
import { KIPPSoCalPublicSchoolsService } from './kippsocal.service';

@Module({ providers: [KIPPSoCalPublicSchoolsService], exports: [KIPPSoCalPublicSchoolsService] })
export class KIPPSoCalPublicSchoolsModule {}
