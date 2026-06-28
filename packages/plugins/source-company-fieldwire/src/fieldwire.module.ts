import { Module } from '@nestjs/common';
import { FieldwireService } from './fieldwire.service';

@Module({ providers: [FieldwireService], exports: [FieldwireService] })
export class FieldwireModule {}
