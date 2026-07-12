import { Module } from '@nestjs/common';
import { SvixService } from './svix.service';

@Module({ providers: [SvixService], exports: [SvixService] })
export class SvixModule {}
