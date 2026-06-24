import { Module } from '@nestjs/common';
import { SlingshotAerospaceService } from './slingshotaerospace.service';

@Module({ providers: [SlingshotAerospaceService], exports: [SlingshotAerospaceService] })
export class SlingshotAerospaceModule {}
