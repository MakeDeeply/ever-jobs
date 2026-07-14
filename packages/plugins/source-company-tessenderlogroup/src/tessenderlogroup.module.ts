import { Module } from '@nestjs/common';
import { TessenderloGroupService } from './tessenderlogroup.service';

@Module({ providers: [TessenderloGroupService], exports: [TessenderloGroupService] })
export class TessenderloGroupModule {}
