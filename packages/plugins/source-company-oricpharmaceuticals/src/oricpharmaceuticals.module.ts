import { Module } from '@nestjs/common';
import { ORICPharmaceuticalsService } from './oricpharmaceuticals.service';

@Module({ providers: [ORICPharmaceuticalsService], exports: [ORICPharmaceuticalsService] })
export class ORICPharmaceuticalsModule {}
