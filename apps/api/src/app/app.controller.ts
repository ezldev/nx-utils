import { Controller, Get } from '@nestjs/common';

import { Message } from '@nx-utils/api-interfaces';

import { AppService } from './app.service';
import {CronService} from './cron.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private cronService:CronService) {}

  @Get('hello')
  getData(): Promise<any> {
    console.log(process.env.test)
    return this.appService.getAvailableStacks();
  }
}
