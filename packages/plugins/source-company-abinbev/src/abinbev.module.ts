import { Module } from '@nestjs/common';
import { ABInBevService } from './abinbev.service';

@Module({ providers: [ABInBevService], exports: [ABInBevService] })
export class ABInBevModule {}
