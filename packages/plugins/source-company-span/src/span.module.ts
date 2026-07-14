import { Module } from '@nestjs/common';
import { SPANService } from './span.service';

@Module({ providers: [SPANService], exports: [SPANService] })
export class SPANModule {}
