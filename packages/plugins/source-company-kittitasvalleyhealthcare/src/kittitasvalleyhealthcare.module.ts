import { Module } from '@nestjs/common';
import { KittitasValleyHealthcareService } from './kittitasvalleyhealthcare.service';

@Module({ providers: [KittitasValleyHealthcareService], exports: [KittitasValleyHealthcareService] })
export class KittitasValleyHealthcareModule {}
