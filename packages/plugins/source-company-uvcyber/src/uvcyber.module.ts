import { Module } from '@nestjs/common';
import { UltraVioletCyberService } from './uvcyber.service';

@Module({ providers: [UltraVioletCyberService], exports: [UltraVioletCyberService] })
export class UltraVioletCyberModule {}
