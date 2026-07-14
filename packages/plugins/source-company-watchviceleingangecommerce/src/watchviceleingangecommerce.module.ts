import { Module } from '@nestjs/common';
import { WATCHVICELeingangECommerceService } from './watchviceleingangecommerce.service';

@Module({ providers: [WATCHVICELeingangECommerceService], exports: [WATCHVICELeingangECommerceService] })
export class WATCHVICELeingangECommerceModule {}
