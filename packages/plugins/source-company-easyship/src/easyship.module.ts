import { Module } from '@nestjs/common';
import { EasyshipService } from './easyship.service';

@Module({ providers: [EasyshipService], exports: [EasyshipService] })
export class EasyshipModule {}
