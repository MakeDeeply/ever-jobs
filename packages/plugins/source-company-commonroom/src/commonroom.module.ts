import { Module } from '@nestjs/common';
import { CommonRoomService } from './commonroom.service';

@Module({ providers: [CommonRoomService], exports: [CommonRoomService] })
export class CommonRoomModule {}
