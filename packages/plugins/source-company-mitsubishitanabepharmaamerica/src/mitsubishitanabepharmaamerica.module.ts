import { Module } from '@nestjs/common';
import { MitsubishiTanabePharmaAmericaService } from './mitsubishitanabepharmaamerica.service';

@Module({ providers: [MitsubishiTanabePharmaAmericaService], exports: [MitsubishiTanabePharmaAmericaService] })
export class MitsubishiTanabePharmaAmericaModule {}
