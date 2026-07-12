import { Module } from '@nestjs/common';
import { EurofinsScientificService } from './eurofinsscientific.service';

@Module({ providers: [EurofinsScientificService], exports: [EurofinsScientificService] })
export class EurofinsScientificModule {}
