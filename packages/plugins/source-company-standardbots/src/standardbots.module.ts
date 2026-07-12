import { Module } from '@nestjs/common';
import { StandardBotsService } from './standardbots.service';

@Module({ providers: [StandardBotsService], exports: [StandardBotsService] })
export class StandardBotsModule {}
