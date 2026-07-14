import { Module } from '@nestjs/common';
import { InstantSystemService } from './instantsystem.service';

@Module({ providers: [InstantSystemService], exports: [InstantSystemService] })
export class InstantSystemModule {}
