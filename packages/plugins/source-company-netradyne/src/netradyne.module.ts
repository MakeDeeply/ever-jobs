import { Module } from '@nestjs/common';
import { NetradyneService } from './netradyne.service';

@Module({ providers: [NetradyneService], exports: [NetradyneService] })
export class NetradyneModule {}
