import { Module } from '@nestjs/common';
import { SpinService } from './spin.service';

@Module({ providers: [SpinService], exports: [SpinService] })
export class SpinModule {}
