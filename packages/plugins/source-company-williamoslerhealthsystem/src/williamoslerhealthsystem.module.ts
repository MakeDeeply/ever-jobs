import { Module } from '@nestjs/common';
import { WilliamOslerHealthSystemService } from './williamoslerhealthsystem.service';

@Module({ providers: [WilliamOslerHealthSystemService], exports: [WilliamOslerHealthSystemService] })
export class WilliamOslerHealthSystemModule {}
