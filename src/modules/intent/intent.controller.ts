import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IntentService } from './intent.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { GetAllIntentDto } from './dto/get-all-intent.dto';
import { UpdateIntentDto } from './dto/update-intent.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../auth/enum/roles.enum';

@Controller('intent')
export class IntentController {
  constructor(
    private readonly intentService: IntentService
  ){}

  @Roles(Role.Administrator)
  @Get()
  async getAll(@Query() query: GetAllIntentDto) {
    return this.intentService.getAllIntent(query);
  }

  @Roles(Role.Administrator)
  @Get('context')
  async getAllContext() {
    return this.intentService.getAllIntentContext();
  }

  @Roles(Role.Administrator)
  @Get(':uuid')
  async getIntentById(@Param('uuid') uuid: string) {
    return this.intentService.getIntentById(uuid);
  }

  @Roles(Role.Administrator)
  @Post()
  async createIntent(@Body() body: CreateIntentDto) {
    return await this.intentService.createIntent(body);
  }

  @Roles(Role.Administrator)
  @Put(':uuid')
  async updateIntent(@Param('uuid') uuid: string, @Body() body: UpdateIntentDto) {
    return await this.intentService.updateIntent(uuid, body);
  }

  @Roles(Role.Administrator)
  @Delete(':uuid')
  async deleteIntent(@Param('uuid') uuid: string){
    return await this.intentService.deleteIntent(uuid);
  }

}
