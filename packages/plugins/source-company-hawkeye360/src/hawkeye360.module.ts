import { Module } from '@nestjs/common';
import { HawkEye360Service } from './hawkeye360.service';

@Module({ providers: [HawkEye360Service], exports: [HawkEye360Service] })
export class HawkEye360Module {}
