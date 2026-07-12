import { Module } from '@nestjs/common';
import { ProphetSecurityService } from './prophetsecurity.service';

@Module({ providers: [ProphetSecurityService], exports: [ProphetSecurityService] })
export class ProphetSecurityModule {}
