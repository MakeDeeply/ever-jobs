import { Module } from '@nestjs/common';
import { OpheliaHealthService } from './ophelia.service';

@Module({ providers: [OpheliaHealthService], exports: [OpheliaHealthService] })
export class OpheliaHealthModule {}
