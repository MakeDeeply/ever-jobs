import { Module } from '@nestjs/common';
import { BlackSkyTechnologyService } from './blacksky.service';

@Module({ providers: [BlackSkyTechnologyService], exports: [BlackSkyTechnologyService] })
export class BlackSkyTechnologyModule {}
