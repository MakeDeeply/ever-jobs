import { Module } from '@nestjs/common';
import { OpenclaimsService } from './openclaims.service';

@Module({ providers: [OpenclaimsService], exports: [OpenclaimsService] })
export class OpenclaimsModule {}
