import { Module } from '@nestjs/common';
import { FieldBuddyService } from './fieldbuddy.service';

@Module({ providers: [FieldBuddyService], exports: [FieldBuddyService] })
export class FieldBuddyModule {}
