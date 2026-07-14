import { Module } from '@nestjs/common';
import { SyngentaGroupService } from './syngentagroup.service';

@Module({ providers: [SyngentaGroupService], exports: [SyngentaGroupService] })
export class SyngentaGroupModule {}
