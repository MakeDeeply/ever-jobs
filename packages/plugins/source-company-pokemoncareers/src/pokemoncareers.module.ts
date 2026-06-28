import { Module } from '@nestjs/common';
import { ThePokMonCompanyInternationalService } from './pokemoncareers.service';

@Module({ providers: [ThePokMonCompanyInternationalService], exports: [ThePokMonCompanyInternationalService] })
export class ThePokMonCompanyInternationalModule {}
