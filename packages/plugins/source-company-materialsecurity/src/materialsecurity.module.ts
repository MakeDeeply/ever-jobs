import { Module } from '@nestjs/common';
import { MaterialSecurityService } from './materialsecurity.service';

@Module({ providers: [MaterialSecurityService], exports: [MaterialSecurityService] })
export class MaterialSecurityModule {}
