import { Module } from '@nestjs/common';
import { OcktoService } from './ockto.service';

@Module({ providers: [OcktoService], exports: [OcktoService] })
export class OcktoModule {}
