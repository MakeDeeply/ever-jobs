import { Module } from '@nestjs/common';
import { NamespaceService } from './namespace.service';

@Module({ providers: [NamespaceService], exports: [NamespaceService] })
export class NamespaceModule {}
