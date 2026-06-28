import { Module } from '@nestjs/common';
import { InnovidService } from './innovid.service';

@Module({ providers: [InnovidService], exports: [InnovidService] })
export class InnovidModule {}
