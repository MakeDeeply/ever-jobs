import { Module } from '@nestjs/common';
import { NewOrbitSpaceService } from './neworbitspace.service';

@Module({ providers: [NewOrbitSpaceService], exports: [NewOrbitSpaceService] })
export class NewOrbitSpaceModule {}
