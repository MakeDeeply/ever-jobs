import { Module } from '@nestjs/common';
import { AssystemService } from './assystem.service';

@Module({ providers: [AssystemService], exports: [AssystemService] })
export class AssystemModule {}
