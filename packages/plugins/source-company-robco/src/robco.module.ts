import { Module } from '@nestjs/common';
import { RobCoService } from './robco.service';

@Module({ providers: [RobCoService], exports: [RobCoService] })
export class RobCoModule {}
