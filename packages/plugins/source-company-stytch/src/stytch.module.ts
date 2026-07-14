import { Module } from '@nestjs/common';
import { StytchService } from './stytch.service';

@Module({ providers: [StytchService], exports: [StytchService] })
export class StytchModule {}
