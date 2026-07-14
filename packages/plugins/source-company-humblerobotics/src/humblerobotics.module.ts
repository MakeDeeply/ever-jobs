import { Module } from '@nestjs/common';
import { HumbleService } from './humblerobotics.service';

@Module({ providers: [HumbleService], exports: [HumbleService] })
export class HumbleModule {}
