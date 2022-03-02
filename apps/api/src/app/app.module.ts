import { CacheModule,Module } from '@nestjs/common';

import { AppController } from './app.controller';
import {HealthController} from './health.controller'
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import {CronService} from './cron.service'
import { TerminusModule } from '@nestjs/terminus';
import { EventsModule } from './events/events.module';

import{HttpModule} from '@nestjs/axios'
//import{ThrottlerModule, ThrottlerGuard} from '@nestjs/throttler'

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    ScheduleModule.forRoot(),
    TerminusModule,
    //EventsModule,
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 10,
    // })
  ],
  controllers: [AppController,
    HealthController
  ],
  providers: [AppService,
    CronService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
  ],
})
export class AppModule {}
