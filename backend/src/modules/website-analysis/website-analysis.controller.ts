import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebsiteAnalyzerService } from './website-analyzer.service';

@ApiTags('Análise de Websites')
@Controller('website-analysis')
export class WebsiteAnalysisController {
  constructor(private readonly websiteAnalyzer: WebsiteAnalyzerService) {}

  @Post('lead/:leadId')
  @ApiOperation({ summary: 'Analisar o website de um lead específico e atualizar pontuação' })
  analyzeLeadWebsite(@Param('leadId') leadId: string) {
    return this.websiteAnalyzer.analyzeLeadWebsite(leadId);
  }

  @Post('url')
  @ApiOperation({ summary: 'Analisar qualquer URL diretamente' })
  analyzeUrl(@Body('url') url: string) {
    return this.websiteAnalyzer.analyzeUrl(url);
  }
}
