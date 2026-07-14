import { Module } from '@nestjs/common';
import { ObservableSpaceService } from './observablespace.service';

@Module({ providers: [ObservableSpaceService], exports: [ObservableSpaceService] })
export class ObservableSpaceModule {}
