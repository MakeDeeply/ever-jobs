import { Module } from '@nestjs/common';
import { PayJoyService } from './payjoy.service';

@Module({ providers: [PayJoyService], exports: [PayJoyService] })
export class PayJoyModule {}
