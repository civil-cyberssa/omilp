# Campanha Google Ads — Site por assinatura

Status: rascunho, não publicado  
Marca: Omi Tecnologia  
Objetivo: vendas de planos de site por assinatura  
Página de destino: https://omitech.com.br/site-por-assinatura  
Data da oferta consultada: 4 de setembro de 2026

## Premissas que precisam de confirmação

- Orçamento inicial confirmado: R$ 15 por dia (aproximadamente R$ 450 por mês).
- Região inicial: Salvador e São Paulo, com presença física da pessoa na região.
- Idioma: português.
- Planos promovidos: Essencial, R$ 45/mês; Profissional, R$ 89,90/mês.
- Rede: somente Pesquisa Google; parceiros de pesquisa e Rede de Display desativados.
- Veiculação: todos os dias, das 7h às 22h, no fuso de Brasília.

O orçamento e o CPA sustentável devem ser revistos com o tempo médio de permanência do assinante, margem bruta e capacidade mensal de entrega da Omi.

## Mensuração antes da ativação

Configurar estas ações antes de usar lances orientados a conversão:

1. `purchase` como conversão primária, disparada somente após confirmação do pagamento.
2. `begin_checkout` como conversão secundária, ao criar o pedido com sucesso.
3. Valor dinâmico em BRL, conforme o plano contratado.
4. Google Ads e GA4 vinculados, com auto-tagging (`gclid`) habilitado.
5. Janela de conversão de clique: 30 dias; atribuição orientada por dados quando disponível.
6. Teste real do fluxo completo e validação no Tag Assistant antes de publicar.

O site carrega o GA4 `G-RKLNFK03PK` e agora envia `begin_checkout` e `purchase` ao `gtag`, incluindo valor, moeda, item e identificador da transação. Antes da campanha, os eventos ainda precisam ser validados no DebugView/Tag Assistant e `purchase` precisa ser marcado como evento principal e importado no Google Ads.

## Configuração da campanha

- Nome: `SEARCH | Site por Assinatura | SSA+SP | Vendas`
- Tipo: Pesquisa.
- Meta: vendas.
- Orçamento confirmado: R$ 15/dia.
- Estratégia inicial: Maximizar cliques, com limite de CPC definido após consultar o Planejador de palavras-chave.
- Estratégia posterior: Maximizar conversões após a mensuração estar validada e acumular dados; considerar CPA desejado somente depois de volume consistente.
- URL final: `https://omitech.com.br/site-por-assinatura`
- Sufixo de URL final: `utm_source=google&utm_medium=cpc&utm_campaign=site_assinatura_search&utm_term={keyword}&utm_content={creative}`
- Correspondência: exata e de frase no início; ampla somente em experimento posterior, com dados de conversão e negativas maduras.

## Grupo 1 — Site por assinatura

Intenção: usuário que já procura o modelo recorrente.

Palavras-chave:

- [site por assinatura]
- [site profissional por assinatura]
- [criação de site por assinatura]
- [plano de site mensal]
- "site por assinatura"
- "site profissional por assinatura"
- "criação de site por assinatura"
- "site mensal para empresa"
- "site por mensalidade"

## Grupo 2 — Criação de site para empresa

Intenção: empresa que procura contratar um site profissional.

Palavras-chave:

- [criação de site para empresa]
- [site profissional para empresa]
- [empresa de criação de sites]
- [site por assinatura]
- [contratar criação de site]
- "criação de site para empresa"
- "criação de site por assinatura"
- "criação de site por assinatura em salvador"
- "site profissional para empresa"
- "empresa que faz site"
- "orçamento de site profissional"
- "desenvolvimento de site empresarial"

## Grupo 3 — Landing page profissional

Intenção: negócio que precisa de uma página para apresentar ou vender uma oferta.

Palavras-chave:

- [landing page profissional]
- [criação de landing page]
- [contratar landing page]
- "landing page para empresa"
- "empresa de landing page"
- "orçamento landing page"

Este grupo deve ser ativado apenas se o plano Essencial atender comercialmente a uma landing page.

## Lista de negativas inicial

- grátis
- gratuito
- free
- curso
- cursos
- tutorial
- como fazer
- faça você mesmo
- emprego
- vaga
- vagas
- salário
- estágio
- template
- modelo pronto
- tema
- wordpress download
- wix login
- canva
- pdf
- apostila
- faculdade
- certificado
- código fonte
- github
- pirata

Revisar os termos de pesquisa pelo menos duas vezes por semana nas quatro primeiras semanas.

## Anúncio responsivo — base

Títulos (máximo de 30 caracteres):

1. Site por Assinatura
2. Site Profissional Mensal
3. Criação de Site Profissional
4. Seu Site a Partir de R$ 45
5. Domínio Incluso no Plano
6. Site Responsivo e Seguro
7. Suporte Contínuo da Omi
8. Contrate Seu Site Online
9. Site Pronto Para Crescer
10. Planos Para Sua Empresa
11. SEO Desde a Estrutura
12. Site com SSL Incluso
13. Design Profissional
14. Conheça os Planos da Omi
15. Escolha Seu Plano Hoje

Descrições (máximo de 90 caracteres):

1. Tenha site profissional, responsivo e com suporte contínuo em um plano mensal.
2. Planos a partir de R$ 45/mês, com domínio, SSL e estrutura preparada para SEO.
3. Escolha o plano online, envie o briefing e acompanhe a criação do seu site.
4. Apresente sua empresa com design profissional e uma equipe cuidando da tecnologia.

Caminhos de exibição:

- Caminho 1: `site-mensal`
- Caminho 2: `planos`

Não fixar títulos no lançamento, salvo exigência regulatória ou resultado claro de teste.

## Ativos

Sitelinks:

- Planos e preços — `https://omitech.com.br/site-por-assinatura#planos`
- Projetos da Omi — `https://omitech.com.br/site-por-assinatura#projetos`
- Como funciona — `https://omitech.com.br/site-por-assinatura`
- Fale no WhatsApp — `https://wa.me/5571992997191`

Destaques:

- Domínio incluso
- Certificado SSL
- Site responsivo
- Suporte contínuo
- Contratação online
- Estrutura para SEO

Snippet estruturado, cabeçalho “Serviços”:

- Site institucional
- Landing page
- Design responsivo
- Suporte mensal

## Experimentos e rotina

Primeiras duas semanas:

- Não tomar decisões com amostra muito pequena.
- Conferir termos de pesquisa e adicionar negativas.
- Verificar perda de impressão por orçamento e classificação.
- Confirmar que compra, receita e origem da campanha aparecem corretamente.

Após dados suficientes:

- Separar Salvador e São Paulo se houver diferença relevante de CPA.
- Testar uma segunda RSA com foco em preço contra outra com foco em suporte e qualidade.
- Realocar verba para o grupo com maior taxa de compra, não apenas maior CTR.
- Avaliar expansão nacional somente depois de validar CPA e capacidade operacional.

## Critério de publicação

A campanha só deve ser habilitada quando estiverem confirmados:

- orçamento diário;
- regiões atendidas;
- capacidade mensal de novos projetos;
- valor econômico da conversão e CPA máximo;
- rastreamento de compra testado;
- forma de pagamento ativa na conta Google Ads;
- aprovação explícita do responsável pela conta.
