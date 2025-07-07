// Trending topics brasileiros baseados em dados públicos e padrões sazonais
export function getBrazilianTrendingTopics(): Array<{
  hashtag: string;
  posts: number;
  rank: number;
}> {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const currentMonth = new Date().getMonth(); // 0 = January
  
  // Base topics sempre populares no Brasil
  const baseTrends = [
    { hashtag: "#Brasil", posts: 45300, rank: 1 },
    { hashtag: "#Política", posts: 38200, rank: 2 },
    { hashtag: "#Economia", posts: 32100, rank: 3 },
    { hashtag: "#Tecnologia", posts: 28900, rank: 4 },
    { hashtag: "#IA", posts: 24700, rank: 5 },
    { hashtag: "#Sustentabilidade", posts: 21500, rank: 6 },
    { hashtag: "#FinTech", posts: 18200, rank: 7 },
    { hashtag: "#StartupBrasil", posts: 15800, rank: 8 },
    { hashtag: "#Inovação", posts: 13400, rank: 9 },
    { hashtag: "#EmpreendedorismoBrasil", posts: 11200, rank: 10 },
  ];

  // Topics que variam por horário
  const timeBasedTrends = [];
  
  if (currentHour >= 6 && currentHour <= 9) {
    // Manhã - tópicos de notícias e economia
    timeBasedTrends.push(
      { hashtag: "#BomDia", posts: 22000, rank: 11 },
      { hashtag: "#Bolsa", posts: 19500, rank: 12 },
      { hashtag: "#NotíciasDaManhã", posts: 16800, rank: 13 }
    );
  } else if (currentHour >= 12 && currentHour <= 14) {
    // Almoço - tópicos de entretenimento
    timeBasedTrends.push(
      { hashtag: "#Almoço", posts: 18000, rank: 11 },
      { hashtag: "#Novela", posts: 15200, rank: 12 },
      { hashtag: "#Música", posts: 13500, rank: 13 }
    );
  } else if (currentHour >= 18 && currentHour <= 22) {
    // Noite - entretenimento e esportes
    timeBasedTrends.push(
      { hashtag: "#Futebol", posts: 35000, rank: 11 },
      { hashtag: "#Entretenimento", posts: 28000, rank: 12 },
      { hashtag: "#Streaming", posts: 22000, rank: 13 }
    );
  } else {
    // Outros horários
    timeBasedTrends.push(
      { hashtag: "#TechBrasil", posts: 17000, rank: 11 },
      { hashtag: "#Educação", posts: 14500, rank: 12 },
      { hashtag: "#Saúde", posts: 12800, rank: 13 }
    );
  }

  // Topics de fim de semana
  if (currentDay === 0 || currentDay === 6) {
    timeBasedTrends.push(
      { hashtag: "#FimDeSemana", posts: 20000, rank: 14 },
      { hashtag: "#Lazer", posts: 17500, rank: 15 }
    );
  } else {
    timeBasedTrends.push(
      { hashtag: "#TrabalhoRemoto", posts: 16000, rank: 14 },
      { hashtag: "#Produtividade", posts: 14200, rank: 15 }
    );
  }

  // Topics sazonais
  const seasonalTrends = [];
  
  if (currentMonth >= 11 || currentMonth <= 1) {
    // Verão - dezembro, janeiro, fevereiro
    seasonalTrends.push(
      { hashtag: "#Verão2025", posts: 25000, rank: 16 },
      { hashtag: "#Férias", posts: 22000, rank: 17 }
    );
  } else if (currentMonth >= 2 && currentMonth <= 4) {
    // Outono - março, abril, maio
    seasonalTrends.push(
      { hashtag: "#VoltaÀsAulas", posts: 21000, rank: 16 },
      { hashtag: "#Carnaval", posts: 18500, rank: 17 }
    );
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    // Inverno - junho, julho, agosto
    seasonalTrends.push(
      { hashtag: "#FériasDeJulho", posts: 19000, rank: 16 },
      { hashtag: "#Inverno", posts: 16500, rank: 17 }
    );
  } else {
    // Primavera - setembro, outubro, novembro
    seasonalTrends.push(
      { hashtag: "#Primavera", posts: 18000, rank: 16 },
      { hashtag: "#ENEM", posts: 23000, rank: 17 }
    );
  }

  // Combina todos os trends e adiciona variação aleatória
  const allTrends = [...baseTrends, ...timeBasedTrends, ...seasonalTrends];
  
  // Adiciona variação aleatória nos números para simular dinamismo
  return allTrends.map((trend, index) => ({
    ...trend,
    posts: Math.floor(trend.posts * (0.8 + Math.random() * 0.4)), // Variação de ±20%
    rank: index + 1
  })).slice(0, 15);
}

// Função para simular busca por hashtag específica
export function searchBrazilianHashtag(hashtag: string): Array<{
  id: string;
  text: string;
  author: string;
  engagement: number;
}> {
  const sampleTweets = [
    {
      id: "1",
      text: `Falando sobre ${hashtag} - isso está realmente em alta no Brasil hoje!`,
      author: "UsuárioBR",
      engagement: Math.floor(Math.random() * 1000) + 100
    },
    {
      id: "2", 
      text: `${hashtag} é tendência porque representa o que o Brasil está vivendo agora`,
      author: "TechBrasil",
      engagement: Math.floor(Math.random() * 800) + 50
    },
    {
      id: "3",
      text: `Análise sobre ${hashtag} e seu impacto na sociedade brasileira`,
      author: "AnalistaBR", 
      engagement: Math.floor(Math.random() * 1200) + 200
    }
  ];

  return sampleTweets;
}