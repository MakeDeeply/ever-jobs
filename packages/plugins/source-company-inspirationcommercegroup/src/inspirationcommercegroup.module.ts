import { Module } from '@nestjs/common';
import { InspirationCommerceGroupService } from './inspirationcommercegroup.service';

@Module({ providers: [InspirationCommerceGroupService], exports: [InspirationCommerceGroupService] })
export class InspirationCommerceGroupModule {}
