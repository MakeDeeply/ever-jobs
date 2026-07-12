import { Module } from '@nestjs/common';
import { DeleteMeService } from './deleteme.service';

@Module({ providers: [DeleteMeService], exports: [DeleteMeService] })
export class DeleteMeModule {}
