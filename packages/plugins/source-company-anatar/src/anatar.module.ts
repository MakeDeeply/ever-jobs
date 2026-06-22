import { Module } from '@nestjs/common';
import { AnatarService } from './anatar.service';

@Module({ providers: [AnatarService], exports: [AnatarService] })
export class AnatarModule {}
