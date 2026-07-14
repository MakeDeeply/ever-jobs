import { Module } from '@nestjs/common';
import { QLFBrandsLampenlichtNlService } from './qlfbrandslampenlichtnl.service';

@Module({ providers: [QLFBrandsLampenlichtNlService], exports: [QLFBrandsLampenlichtNlService] })
export class QLFBrandsLampenlichtNlModule {}
