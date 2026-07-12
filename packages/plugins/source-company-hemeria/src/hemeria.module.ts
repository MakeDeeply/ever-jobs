import { Module } from '@nestjs/common';
import { HEMERIAService } from './hemeria.service';

@Module({ providers: [HEMERIAService], exports: [HEMERIAService] })
export class HEMERIAModule {}
