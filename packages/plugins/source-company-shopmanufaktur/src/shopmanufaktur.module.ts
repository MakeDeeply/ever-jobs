import { Module } from '@nestjs/common';
import { ShopManufakturService } from './shopmanufaktur.service';

@Module({ providers: [ShopManufakturService], exports: [ShopManufakturService] })
export class ShopManufakturModule {}
