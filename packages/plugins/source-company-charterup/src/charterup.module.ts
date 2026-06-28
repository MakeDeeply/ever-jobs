import { Module } from '@nestjs/common';
import { CharterUPService } from './charterup.service';

@Module({ providers: [CharterUPService], exports: [CharterUPService] })
export class CharterUPModule {}
