import { Module } from '@nestjs/common';
import { WindRangerLabsService } from './windrangerlabs.service';

@Module({ providers: [WindRangerLabsService], exports: [WindRangerLabsService] })
export class WindRangerLabsModule {}
