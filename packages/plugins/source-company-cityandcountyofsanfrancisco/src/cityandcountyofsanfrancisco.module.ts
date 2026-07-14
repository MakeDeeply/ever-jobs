import { Module } from '@nestjs/common';
import { CityAndCountyOfSanFranciscoService } from './cityandcountyofsanfrancisco.service';

@Module({ providers: [CityAndCountyOfSanFranciscoService], exports: [CityAndCountyOfSanFranciscoService] })
export class CityAndCountyOfSanFranciscoModule {}
