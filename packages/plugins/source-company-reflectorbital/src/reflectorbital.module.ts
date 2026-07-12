import { Module } from '@nestjs/common';
import { ReflectOrbitalService } from './reflectorbital.service';

@Module({ providers: [ReflectOrbitalService], exports: [ReflectOrbitalService] })
export class ReflectOrbitalModule {}
