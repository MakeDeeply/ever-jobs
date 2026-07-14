import { Module } from '@nestjs/common';
import { RapidMicroBiosystemsService } from './rapidmicrobio.service';

@Module({ providers: [RapidMicroBiosystemsService], exports: [RapidMicroBiosystemsService] })
export class RapidMicroBiosystemsModule {}
