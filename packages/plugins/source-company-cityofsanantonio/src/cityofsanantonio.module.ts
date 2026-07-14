import { Module } from '@nestjs/common';
import { CityOfSanAntonioService } from './cityofsanantonio.service';

@Module({ providers: [CityOfSanAntonioService], exports: [CityOfSanAntonioService] })
export class CityOfSanAntonioModule {}
