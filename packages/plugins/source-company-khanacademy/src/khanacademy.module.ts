import { Module } from '@nestjs/common';
import { KhanAcademyService } from './khanacademy.service';

@Module({ providers: [KhanAcademyService], exports: [KhanAcademyService] })
export class KhanAcademyModule {}
