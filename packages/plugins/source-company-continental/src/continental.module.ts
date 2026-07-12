import { Module } from '@nestjs/common';
import { ContinentalService } from './continental.service';

@Module({ providers: [ContinentalService], exports: [ContinentalService] })
export class ContinentalModule {}
