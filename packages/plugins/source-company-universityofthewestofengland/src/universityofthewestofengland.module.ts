import { Module } from '@nestjs/common';
import { UniversityOfTheWestOfEnglandService } from './universityofthewestofengland.service';

@Module({ providers: [UniversityOfTheWestOfEnglandService], exports: [UniversityOfTheWestOfEnglandService] })
export class UniversityOfTheWestOfEnglandModule {}
