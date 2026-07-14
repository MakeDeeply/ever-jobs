import { Module } from '@nestjs/common';
import { AlnylamPharmaceuticalsService } from './alnylampharmaceuticals.service';

@Module({ providers: [AlnylamPharmaceuticalsService], exports: [AlnylamPharmaceuticalsService] })
export class AlnylamPharmaceuticalsModule {}
