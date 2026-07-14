import { Module } from '@nestjs/common';
import { OloService } from './olo.service';

@Module({ providers: [OloService], exports: [OloService] })
export class OloModule {}
