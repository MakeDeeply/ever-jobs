import { Module } from '@nestjs/common';
import { GravityRDService } from './gravity.service';

@Module({ providers: [GravityRDService], exports: [GravityRDService] })
export class GravityRDModule {}
