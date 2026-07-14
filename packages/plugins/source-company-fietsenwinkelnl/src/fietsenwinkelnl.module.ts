import { Module } from '@nestjs/common';
import { FietsenwinkelNlService } from './fietsenwinkelnl.service';

@Module({ providers: [FietsenwinkelNlService], exports: [FietsenwinkelNlService] })
export class FietsenwinkelNlModule {}
