import { Module } from '@nestjs/common';
import { CyderesService } from './cyderes.service';

@Module({ providers: [CyderesService], exports: [CyderesService] })
export class CyderesModule {}
