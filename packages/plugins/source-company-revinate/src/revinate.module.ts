import { Module } from '@nestjs/common';
import { RevinateService } from './revinate.service';

@Module({ providers: [RevinateService], exports: [RevinateService] })
export class RevinateModule {}
