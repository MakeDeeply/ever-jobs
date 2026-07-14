import { Module } from '@nestjs/common';
import { VertiGISService } from './vertigis.service';

@Module({ providers: [VertiGISService], exports: [VertiGISService] })
export class VertiGISModule {}
