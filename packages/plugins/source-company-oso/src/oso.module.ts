import { Module } from '@nestjs/common';
import { OsoService } from './oso.service';

@Module({ providers: [OsoService], exports: [OsoService] })
export class OsoModule {}
