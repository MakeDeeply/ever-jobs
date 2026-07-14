import { Module } from '@nestjs/common';
import { ReonicService } from './reonic.service';

@Module({ providers: [ReonicService], exports: [ReonicService] })
export class ReonicModule {}
