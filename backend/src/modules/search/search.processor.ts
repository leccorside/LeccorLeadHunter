import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { SearchProviderFactory } from '../providers/search-provider.factory';
import { DefaultWhatsAppVerificationProvider } from '../providers/whatsapp/default-whatsapp-verification.provider';
import { ScoringService } from '../leads/services/scoring.service';
import { normalizePhone } from '../../common/utils/phone-normalizer';
import { SearchStatus, WhatsAppStatus } from '@prisma/client';
import { RawLeadResult } from '../providers/interfaces/search-provider.interface';

@Processor('lead-search')
export class SearchProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: SearchProviderFactory,
    private readonly whatsappVerifier: DefaultWhatsAppVerificationProvider,
    private readonly scoringService: ScoringService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { searchId, dto } = job.data;
    this.logger.log(`[Job ${job.id}] Iniciando processamento da busca ID: ${searchId}`);

    // Verifica se a busca foi cancelada antes de iniciar
    const currentSearch = await this.prisma.search.findUnique({
      where: { id: searchId },
    });

    if (!currentSearch || currentSearch.status === SearchStatus.CANCELLED) {
      this.logger.warn(`Busca ${searchId} já foi cancelada ou não existe.`);
      return;
    }

    await this.prisma.search.update({
      where: { id: searchId },
      data: { status: SearchStatus.PROCESSING },
    });

    try {
      // 1. Obter provedor e buscar empresas
      const provider = this.providerFactory.getProvider(dto.provider);
      this.logger.log(`Buscando via provedor: ${provider.name}`);

      let rawResults: RawLeadResult[] = [];
      try {
        rawResults = await provider.search({
          country: dto.country || 'BR',
          state: dto.state,
          city: dto.city,
          category: dto.categoryName || 'Comércio Local',
          radiusKm: dto.radiusKm,
          maxResults: dto.maxResults,
        });
      } catch (provErr: any) {
        this.logger.error(`Falha no provedor ${provider.name}: ${provErr.message}`);
      }

      // Se o provedor principal (ex: Google Places com chave restrita/bloqueada) retornou 0 empresas, aciona fallback para OpenStreetMap
      if (rawResults.length === 0 && dto.provider !== 'OPENSTREETMAP') {
        this.logger.warn(
          `Provedor ${provider.name} não retornou empresas (chave de API não autorizada ou sem resultados). Ativando fallback automático para OPENSTREETMAP...`,
        );
        try {
          const fallbackProvider = this.providerFactory.getProvider('OPENSTREETMAP');
          rawResults = await fallbackProvider.search({
            country: dto.country || 'BR',
            state: dto.state,
            city: dto.city,
            category: dto.categoryName || 'Comércio Local',
            radiusKm: dto.radiusKm,
            maxResults: dto.maxResults,
          });
          this.logger.log(`Fallback OpenStreetMap retornou ${rawResults.length} empresas.`);
        } catch (fbErr: any) {
          this.logger.error(`Erro no fallback OpenStreetMap: ${fbErr.message}`);
        }
      }

      this.logger.log(`Total consolidado: ${rawResults.length} empresas brutas encontradas.`);

      await this.prisma.search.update({
        where: { id: searchId },
        data: { totalFound: rawResults.length },
      });

      let processedCount = 0;
      let newLeadsCount = 0;
      let duplicateCount = 0;
      let noPhoneCount = 0;
      let whatsappCount = 0;

      // 2. Iterar e processar cada empresa
      for (const raw of rawResults) {
        // Checar se foi cancelado durante o loop
        const checkSearch = await this.prisma.search.findUnique({
          where: { id: searchId },
          select: { status: true },
        });
        if (checkSearch?.status === SearchStatus.CANCELLED) {
          this.logger.warn(`Busca ${searchId} cancelada pelo usuário durante processamento.`);
          break;
        }

        processedCount++;

        // Filtro: somente sem site
        if (dto.onlyWithoutWebsite && raw.hasWebsite) {
          continue;
        }

        // Filtro: somente com telefone
        if (dto.onlyWithPhone && (!raw.phone || raw.phone.trim().length < 6)) {
          noPhoneCount++;
          continue;
        }

        if (!raw.phone) {
          noPhoneCount++;
        }

        // Normalização de telefone
        const phoneNorm = normalizePhone(raw.phone);

        // Verificação WhatsApp: por padrão NOT_FOUND a menos que telefone seja válido
        let whatsappStatus: WhatsAppStatus = WhatsAppStatus.NOT_FOUND;
        if (phoneNorm.isValid) {
          const verification = await this.whatsappVerifier.verify(phoneNorm.digits);
          whatsappStatus = verification.status;
          if (whatsappStatus !== WhatsAppStatus.NOT_FOUND && phoneNorm.isMobile) {
            whatsappCount++;
          }
        }

        // Filtro: somente com WhatsApp
        if (dto.onlyWithWhatsapp && !phoneNorm.isMobile) {
          continue;
        }

        // Filtro: somente sem WhatsApp
        if (dto.onlyWithoutWhatsapp && phoneNorm.isMobile) {
          continue;
        }

        // Filtro: avaliações
        const reviewCount = raw.reviewCount || 0;
        if (dto.minReviews !== undefined && reviewCount < dto.minReviews) continue;
        if (dto.maxReviews !== undefined && reviewCount > dto.maxReviews) continue;

        // Filtro: nota
        const rating = raw.rating || 0;
        if (dto.minRating !== undefined && rating < dto.minRating) continue;
        if (dto.maxRating !== undefined && rating > dto.maxRating) continue;

        // 3. DETECÇÃO DE DUPLICADOS (Requisito #8)
        let isDuplicate = false;
        let existingLead: any = null;

        // Regra A: provider + providerPlaceId
        if (raw.providerPlaceId) {
          existingLead = await this.prisma.lead.findFirst({
            where: {
              provider: raw.provider,
              providerPlaceId: raw.providerPlaceId,
            },
          });
        }

        // Regra B: normalizedPhone (exceto números centrais/0800 compartilhados por redes e franquias)
        const isTollFreeOrCentral =
          phoneNorm.e164 &&
          (phoneNorm.e164.startsWith('55800') ||
            phoneNorm.e164.startsWith('550800') ||
            phoneNorm.e164.startsWith('55300') ||
            phoneNorm.e164.startsWith('55400'));
        if (!existingLead && phoneNorm.isValid && !isTollFreeOrCentral) {
          existingLead = await this.prisma.lead.findFirst({
            where: {
              normalizedPhone: phoneNorm.e164,
            },
          });
        }


        // Regra C: website
        if (!existingLead && raw.website) {
          existingLead = await this.prisma.lead.findFirst({
            where: {
              website: raw.website,
            },
          });
        }

        // Regra D: nome + cidade
        if (!existingLead && raw.name) {
          existingLead = await this.prisma.lead.findFirst({
            where: {
              name: { equals: raw.name, mode: 'insensitive' },
              city: { equals: dto.city, mode: 'insensitive' },
            },
          });
        }

        if (existingLead) {
          isDuplicate = true;
          duplicateCount++;

          // Cria vínculo no searchResult para registro
          await this.prisma.searchResult.create({
            data: {
              searchId,
              leadId: existingLead.id,
              isDuplicate: true,
            },
          });

          if (dto.excludeExisting) {
            continue;
          }
        }

        // 4. Calcular Score de Oportunidade
        const scoreBreakdown = this.scoringService.calculateScore({
          hasWebsite: raw.hasWebsite,
          phone: raw.phone,
          normalizedPhone: phoneNorm.isValid ? phoneNorm.e164 : null,
          whatsappStatus,
          reviewCount: raw.reviewCount,
          rating: raw.rating,
        });

        // Determinar o categoryId correto para o lead
        let targetCategoryId = dto.categoryId || null;
        if (raw.category) {
          const catSlug = raw.category
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-');

          let matchedCat = await this.prisma.category.findFirst({
            where: {
              OR: [
                { slug: catSlug },
                { name: { equals: raw.category, mode: 'insensitive' } },
              ],
            },
          });

          if (
            !matchedCat &&
            raw.category &&
            raw.category !== 'Todas as categorias' &&
            raw.category !== 'Comércio Local'
          ) {
            try {
              matchedCat = await this.prisma.category.create({
                data: {
                  name: raw.category,
                  slug: catSlug,
                  isCustom: true,
                },
              });
            } catch {
              matchedCat = await this.prisma.category.findFirst({
                where: { slug: catSlug },
              });
            }
          }

          if (matchedCat) {
            targetCategoryId = matchedCat.id;
          }
        }

        // 5. Salvar Lead no Banco de Dados
        const createdLead = await this.prisma.lead.create({
          data: {
            provider: raw.provider,
            providerPlaceId: raw.providerPlaceId,
            name: raw.name,
            tradeName: raw.tradeName,
            categoryId: targetCategoryId,
            phone: raw.phone,
            normalizedPhone: phoneNorm.isValid ? phoneNorm.e164 : null,
            whatsapp: phoneNorm.isMobile ? phoneNorm.e164 : null,
            whatsappStatus,
            email: raw.email,
            website: raw.website,
            hasWebsite: raw.hasWebsite,
            address: raw.address,
            neighborhood: raw.neighborhood,
            city: raw.city || dto.city,
            state: raw.state || dto.state,
            country: raw.country || dto.country || 'BR',
            postalCode: raw.postalCode,
            latitude: raw.latitude,
            longitude: raw.longitude,
            googleMapsUrl: raw.googleMapsUrl,
            rating: raw.rating,
            reviewCount: raw.reviewCount,
            openingHours: raw.openingHours,
            businessStatus: raw.businessStatus,
            description: raw.description,
            score: scoreBreakdown.score,
            status: 'NOVO',
            source: raw.provider,
            history: {
              create: {
                action: 'DESCOBERTA',
                description: `Lead encontrado na busca em ${dto.city} - ${dto.state}`,
                metadata: {
                  searchId,
                  score: scoreBreakdown.score,
                  provider: raw.provider,
                },
              },
            },
          },
        });

        // Registrar vínculo no SearchResult
        await this.prisma.searchResult.create({
          data: {
            searchId,
            leadId: createdLead.id,
            isDuplicate: false,
          },
        });

        newLeadsCount++;

        // Atualiza progresso da busca a cada 3 leads processados
        if (processedCount % 3 === 0) {
          await this.prisma.search.update({
            where: { id: searchId },
            data: {
              processedCount,
              newLeadsCount,
              duplicateCount,
              noPhoneCount,
              whatsappCount,
            },
          });
          await job.updateProgress({
            processed: processedCount,
            total: rawResults.length,
          });
        }
      }

      // Conclusão com sucesso
      await this.prisma.search.update({
        where: { id: searchId },
        data: {
          status: SearchStatus.COMPLETED,
          processedCount,
          newLeadsCount,
          duplicateCount,
          noPhoneCount,
          whatsappCount,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Busca ${searchId} concluída: ${newLeadsCount} novos leads, ${duplicateCount} duplicados.`,
      );
    } catch (err: any) {
      this.logger.error(`Erro ao processar busca ${searchId}: ${err.message}`, err.stack);
      await this.prisma.search.update({
        where: { id: searchId },
        data: {
          status: SearchStatus.FAILED,
          error: err.message,
          completedAt: new Date(),
        },
      });
      throw err;
    }
  }
}
