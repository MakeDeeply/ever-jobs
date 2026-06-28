import { Module } from '@nestjs/common';
import { IntegratedSpecialtyCoveragesService } from './isccareers.service';

@Module({ providers: [IntegratedSpecialtyCoveragesService], exports: [IntegratedSpecialtyCoveragesService] })
export class IntegratedSpecialtyCoveragesModule {}
