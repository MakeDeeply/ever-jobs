import { Module } from '@nestjs/common';
import { MatillionService } from './matillion.service';

@Module({ providers: [MatillionService], exports: [MatillionService] })
export class MatillionModule {}
