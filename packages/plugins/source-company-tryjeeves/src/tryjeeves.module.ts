import { Module } from '@nestjs/common';
import { JeevesService } from './tryjeeves.service';

@Module({ providers: [JeevesService], exports: [JeevesService] })
export class JeevesModule {}
