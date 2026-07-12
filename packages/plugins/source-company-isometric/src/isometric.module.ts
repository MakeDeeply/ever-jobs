import { Module } from '@nestjs/common';
import { IsometricService } from './isometric.service';

@Module({ providers: [IsometricService], exports: [IsometricService] })
export class IsometricModule {}
