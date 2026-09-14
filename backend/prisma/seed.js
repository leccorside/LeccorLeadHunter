const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados LeadHunter Local...');

  // 1. Categorias Padrão
  const standardCategories = [
    { name: 'Restaurantes', slug: 'restaurantes', icon: 'Utensils' },
    { name: 'Bares', slug: 'bares', icon: 'Beer' },
    { name: 'Advogados', slug: 'advogados', icon: 'Scale' },
    { name: 'Clínicas', slug: 'clinicas', icon: 'Activity' },
    { name: 'Dentistas', slug: 'dentistas', icon: 'Smile' },
    { name: 'Academias', slug: 'academias', icon: 'Dumbbell' },
    { name: 'Salões de beleza', slug: 'saloes-de-beleza', icon: 'Sparkles' },
    { name: 'Barbearias', slug: 'barbearias', icon: 'Scissors' },
    { name: 'Mercados', slug: 'mercados', icon: 'ShoppingCart' },
    { name: 'Lojas', slug: 'lojas', icon: 'Store' },
    { name: 'Autoescolas', slug: 'autoescolas', icon: 'Car' },
    { name: 'Oficinas', slug: 'oficinas', icon: 'Wrench' },
    { name: 'Hotéis', slug: 'hoteis', icon: 'Hotel' },
    { name: 'Pousadas', slug: 'pousadas', icon: 'Home' },
    { name: 'Imobiliárias', slug: 'imobiliarias', icon: 'Building' },
    { name: 'Contadores', slug: 'contadores', icon: 'Calculator' },
    { name: 'Veterinários', slug: 'veterinarios', icon: 'HeartPulse' },
    { name: 'Pet Shops', slug: 'pet-shops', icon: 'Dog' },
    { name: 'Construção', slug: 'construcao', icon: 'Hammer' },
    { name: 'Fotógrafos', slug: 'fotografos', icon: 'Camera' },
    { name: 'Escolas', slug: 'escolas', icon: 'GraduationCap' },
    { name: 'Cursos', slug: 'cursos', icon: 'BookOpen' },
    { name: 'Eletricistas', slug: 'eletricistas', icon: 'Zap' },
    { name: 'Encanadores', slug: 'encanadores', icon: 'Droplet' },
    { name: 'Ar-condicionado', slug: 'ar-condicionado', icon: 'Wind' },
    { name: 'Transportadoras', slug: 'transportadoras', icon: 'Truck' },
    { name: 'Empresas de tecnologia', slug: 'empresas-de-tecnologia', icon: 'Cpu' },
    { name: 'Profissionais autônomos', slug: 'profissionais-autonomos', icon: 'UserCheck' },
  ];

  for (const cat of standardCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        isCustom: false,
      },
    });
  }
  console.log(`Categorias padrão inseridas (${standardCategories.length})`);

  // 2. Templates de Mensagens WhatsApp
  const defaultTemplates = [
    {
      name: 'Apresentação Geral (Sem Site)',
      content:
        'Olá {{nome}}, tudo bem? Encontrei a {{empresa}} enquanto pesquisava empresas da região de {{cidade}} - {{estado}}. Trabalho com desenvolvimento de sites, sistemas e soluções digitais e percebi que talvez eu consiga ajudar vocês a melhorar a presença digital da empresa. Caso tenha interesse, posso te mostrar algumas ideias sem compromisso!',
      isActive: true,
    },
    {
      name: 'Modernização de Site',
      content:
        'Olá {{nome}}! Tudo bem? Dei uma olhada no site da {{empresa}} ({{site}}) e notei que podemos aplicar algumas melhorias de velocidade, design e captação de clientes para destacar vocês ainda mais em {{cidade}}. Posso compartilhar uma análise rápida com você?',
      isActive: true,
    },
    {
      name: 'Foco em Restaurantes e Gastronomia',
      content:
        'Olá equipe da {{empresa}}, tudo bem? Vocês têm um cardápio digital próprio e presença online forte em {{cidade}}? Ajudamos restaurantes da região a aumentarem pedidos diretos sem depender 100% de taxas de marketplaces. Vamos bater um papo rápido de 5 minutos?',
      isActive: true,
    },
    {
      name: 'Follow-up Contato Anterior',
      content:
        'Oi {{nome}}, tudo bem? Passando só para saber se conseguiu dar uma olhada na mensagem anterior sobre a presença digital da {{empresa}} em {{cidade}}. Quando tiver um tempinho, estou à disposição!',
      isActive: true,
    },
  ];

  for (const tmpl of defaultTemplates) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { name: tmpl.name },
    });
    if (!existing) {
      await prisma.messageTemplate.create({ data: tmpl });
    }
  }
  console.log(`Templates de mensagem inseridos (${defaultTemplates.length})`);

  // 3. Configurações Globais do Sistema
  const defaultSettings = [
    {
      key: 'google_maps_api_key',
      value: process.env.GOOGLE_MAPS_API_KEY || '',
      description: 'Chave da Google Places API (Google Maps Platform)',
      group: 'GOOGLE_API',
    },
    {
      key: 'search_default_radius_km',
      value: '15',
      description: 'Raio padrão de busca em quilômetros',
      group: 'SEARCH',
    },
    {
      key: 'search_default_limit',
      value: '60',
      description: 'Quantidade padrão de resultados por busca',
      group: 'SEARCH',
    },
    {
      key: 'whatsapp_default_message',
      value:
        'Olá {{nome}}, tudo bem? Encontrei a {{empresa}} em {{cidade}} e gostaria de apresentar uma proposta para melhorar a presença digital e atração de novos clientes para o seu negócio.',
      description: 'Mensagem padrão pré-preenchida no WhatsApp',
      group: 'WHATSAPP',
    },
    {
      key: 'score_no_website_weight',
      value: '40',
      description: 'Pontos adicionados caso a empresa NÃO possua site',
      group: 'SCORE',
    },
    {
      key: 'score_has_phone_weight',
      value: '10',
      description: 'Pontos adicionados caso a empresa possua telefone',
      group: 'SCORE',
    },
    {
      key: 'score_has_whatsapp_weight',
      value: '20',
      description: 'Pontos adicionados caso o telefone possua WhatsApp',
      group: 'SCORE',
    },
    {
      key: 'score_min_reviews_20_weight',
      value: '10',
      description: 'Pontos adicionados caso a empresa tenha mais de 20 avaliações',
      group: 'SCORE',
    },
    {
      key: 'score_min_reviews_100_weight',
      value: '10',
      description: 'Pontos adicionados caso a empresa tenha mais de 100 avaliações',
      group: 'SCORE',
    },
    {
      key: 'score_good_rating_weight',
      value: '5',
      description: 'Pontos adicionados caso a nota seja >= 4.0',
      group: 'SCORE',
    },
    {
      key: 'score_bad_website_weight',
      value: '15',
      description: 'Pontos adicionados se o site for lento, sem HTTPS ou com problemas',
      group: 'SCORE',
    },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Configurações padrão inseridas (${defaultSettings.length})`);

  // 4. Cidades Brasileiras de Exemplo para Busca Rápida
  const sampleLocations = [
    { city: 'Caldas Novas', state: 'Goiás', country: 'BR', latitude: -17.7444, longitude: -48.6253 },
    { city: 'Goiânia', state: 'Goiás', country: 'BR', latitude: -16.6869, longitude: -49.2648 },
    { city: 'Anápolis', state: 'Goiás', country: 'BR', latitude: -16.3267, longitude: -48.9534 },
    { city: 'Brasília', state: 'Distrito Federal', country: 'BR', latitude: -15.7975, longitude: -47.8919 },
    { city: 'São Paulo', state: 'São Paulo', country: 'BR', latitude: -23.5505, longitude: -46.6333 },
    { city: 'Campinas', state: 'São Paulo', country: 'BR', latitude: -22.9099, longitude: -47.0626 },
    { city: 'Rio de Janeiro', state: 'Rio de Janeiro', country: 'BR', latitude: -22.9068, longitude: -43.1729 },
    { city: 'Belo Horizonte', state: 'Minas Gerais', country: 'BR', latitude: -19.9167, longitude: -43.9345 },
    { city: 'Uberlândia', state: 'Minas Gerais', country: 'BR', latitude: -18.9186, longitude: -48.2772 },
    { city: 'Curitiba', state: 'Paraná', country: 'BR', latitude: -25.4290, longitude: -49.2671 },
    { city: 'Florianópolis', state: 'Santa Catarina', country: 'BR', latitude: -27.5954, longitude: -48.5480 },
    { city: 'Porto Alegre', state: 'Rio Grande do Sul', country: 'BR', latitude: -30.0346, longitude: -51.2177 },
    { city: 'Salvador', state: 'Bahia', country: 'BR', latitude: -12.9777, longitude: -38.5016 },
    { city: 'Fortaleza', state: 'Ceará', country: 'BR', latitude: -3.7172, longitude: -38.5433 },
    { city: 'Recife', state: 'Pernambuco', country: 'BR', latitude: -8.0476, longitude: -34.8770 },
  ];

  for (const loc of sampleLocations) {
    await prisma.location.upsert({
      where: {
        city_state_country: {
          city: loc.city,
          state: loc.state,
          country: loc.country,
        },
      },
      update: {},
      create: loc,
    });
  }
  console.log(`Localizações padrão inseridas (${sampleLocations.length})`);

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
