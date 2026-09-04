import { Module } from '@nestjs/common';
import { TheSpaceportcompanyService } from './thespaceportcompany.service';

@Module({
  providers: [TheSpaceportcompanyService],
  exports: [TheSpaceportcompanyService],
})
export class TheSpaceportcompanyModule {}
