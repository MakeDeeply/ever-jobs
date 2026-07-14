import { Module } from '@nestjs/common';
import { IbVogtService } from './ibvogt.service';

@Module({ providers: [IbVogtService], exports: [IbVogtService] })
export class IbVogtModule {}
