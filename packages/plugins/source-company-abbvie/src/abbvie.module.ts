import { Module } from '@nestjs/common';
import { AbbVieService } from './abbvie.service';

@Module({ providers: [AbbVieService], exports: [AbbVieService] })
export class AbbVieModule {}
