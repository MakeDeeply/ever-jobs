import { Module } from '@nestjs/common';
import { CVUKService } from './cvuk.service';

@Module({ providers: [CVUKService], exports: [CVUKService] })
export class CVUKModule {}
