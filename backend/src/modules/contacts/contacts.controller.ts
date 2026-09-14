import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';

@ApiTags('Contatos')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os contatos realizados' })
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Listar contatos de um lead específico' })
  findByLead(@Param('leadId') leadId: string) {
    return this.contactsService.findByLead(leadId);
  }
}
