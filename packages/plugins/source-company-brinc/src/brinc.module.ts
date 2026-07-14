import { Module } from '@nestjs/common';
import { BRINCService } from './brinc.service';

@Module({ providers: [BRINCService], exports: [BRINCService] })
export class BRINCModule {}
