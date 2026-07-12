import { Module } from '@nestjs/common';
import { CountyOfGrandePrairieNo1Service } from './countyofgrandeprairieno1.service';

@Module({ providers: [CountyOfGrandePrairieNo1Service], exports: [CountyOfGrandePrairieNo1Service] })
export class CountyOfGrandePrairieNo1Module {}
