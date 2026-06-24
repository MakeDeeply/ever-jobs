import { Module } from '@nestjs/common';
import { ASTSpaceMobileService } from './astspacemobile.service';

@Module({ providers: [ASTSpaceMobileService], exports: [ASTSpaceMobileService] })
export class ASTSpaceMobileModule {}
