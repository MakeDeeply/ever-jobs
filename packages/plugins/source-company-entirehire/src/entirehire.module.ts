import { Module } from '@nestjs/common';
import { EntireHireService } from './entirehire.service';

@Module({ providers: [EntireHireService], exports: [EntireHireService] })
export class EntireHireModule {}
