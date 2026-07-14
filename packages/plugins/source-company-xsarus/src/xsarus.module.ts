import { Module } from '@nestjs/common';
import { XSARUSService } from './xsarus.service';

@Module({ providers: [XSARUSService], exports: [XSARUSService] })
export class XSARUSModule {}
