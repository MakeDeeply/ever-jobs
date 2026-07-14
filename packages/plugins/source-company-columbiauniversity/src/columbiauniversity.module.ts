import { Module } from '@nestjs/common';
import { ColumbiaUniversityService } from './columbiauniversity.service';

@Module({ providers: [ColumbiaUniversityService], exports: [ColumbiaUniversityService] })
export class ColumbiaUniversityModule {}
