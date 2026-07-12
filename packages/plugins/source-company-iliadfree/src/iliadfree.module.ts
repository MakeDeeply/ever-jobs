import { Module } from '@nestjs/common';
import { IliadFreeService } from './iliadfree.service';

@Module({ providers: [IliadFreeService], exports: [IliadFreeService] })
export class IliadFreeModule {}
