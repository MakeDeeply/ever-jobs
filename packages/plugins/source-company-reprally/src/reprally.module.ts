import { Module } from '@nestjs/common';
import { RepRallyService } from './reprally.service';

@Module({ providers: [RepRallyService], exports: [RepRallyService] })
export class RepRallyModule {}
