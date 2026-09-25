/**
 * Biblioteca de fichas olfativas — pesquisada a partir das pirâmides oficiais
 * dos perfumes originais que inspiram cada item "Brand Collection".
 *
 * Cada chave é o "núcleo" do nome do perfume de referência, normalizado
 * (sem acento, minúsculo). O casamento é feito por normalize() + inclusão de
 * substring, então não precisa bater 100% com o texto do produto no Firestore.
 *
 * Isso é só o valor PADRÃO exibido quando o produto não tem ficha própria
 * salva no banco. Se você preencher description/family/notesTop/Heart/Base
 * no admin, o valor do banco sempre tem prioridade sobre esta lista.
 */

export function normalize(s) {
    return (s || '')
        .replace(/@/g, 'a')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Extrai o nome do perfume de referência de dentro de "Brand Collection ### - Inspiração X - 25ml"
export function extractReference(productName) {
    const m = (productName || '').match(/inspira[cç][aã]o\s+(.+)/i);
    let ref = m ? m[1] : productName;
    ref = ref.replace(/\(.*?\)/g, ' ');          // remove parênteses
    ref = ref.replace(/[-–]?\s*\d+\s*ml.*$/i, ''); // remove "- 25ml" e tudo depois
    return normalize(ref);
}

export const FRAGRANCE_LIBRARY = {
    'acqua di gio giorgio armani': { family: 'Aquático Amadeirado', top: 'Bergamota, limão, notas marinhas', heart: 'Jasmim, alecrim, sálvia-esclareia', base: 'Almíscar branco, cedro, patchouli', blurb: 'A brisa mediterrânea engarrafada — o clássico aquático que definiu o gênero para os homens.' },
    'irresistible givenchy': { family: 'Floral Frutado', top: 'Pera, bergamota', heart: 'Rosa, peônia', base: 'Almíscar, madeiras', blurb: 'Rosa moderna com um fundo cremoso e sedutor, pensada para o dia a dia com presença.' },
    'flower by kenzo': { family: 'Floral', top: 'Groselha-preta, framboesa', heart: 'Rosa da Bulgária, violeta', base: 'Baunilha, opoponax', blurb: 'Um poema floral — a rosa contra o concreto, doce e levemente empoeirada.' },
    'delina parfums de marly': { family: 'Floral Chipre', top: 'Bergamota, ruibarbo, lichia, noz-moscada', heart: 'Rosa turca, peônia, baunilha', base: 'Almíscar, cashmeran, vetiver do Haiti, cedro', blurb: 'Rosa royal com trilha aveludada — o floral mais desejado da nova perfumaria de nicho.' },
    'lady million empire': { family: 'Floral Âmbar Dourado', top: 'Mandarina, framboesa', heart: 'Jasmim, flor de laranjeira', base: 'Caramelo, patchouli, baunilha', blurb: 'A assinatura Lady Million em versão mais densa e dourada, para presença de peso.' },
    'lady million': { family: 'Floral Frutado', top: 'Framboesa, groselha-preta, laranja amarga', heart: 'Jasmim, flor de laranjeira, gardênia', base: 'Mel, patchouli, âmbar', blurb: 'Frutado luminoso com coração floral opulento — assinatura de quem entra na sala e é notada.' },
    'issey miyake l eau d issey': { family: 'Floral Aquático', top: 'Lótus, ciclame, freesia', heart: 'Lírio, peônia, jasmim', base: 'Almíscar, madeira de sândalo, cedro', blurb: 'Água pura em forma de perfume — o floral aquático que inspirou uma geração inteira do gênero.' },
    'nina ricci mademoiselle': { family: 'Floral Frutado', top: 'Maçã verde, pera', heart: 'Rosa, jasmim', base: 'Almíscar, madeiras claras', blurb: 'Frescor juvenil com coração floral suave — leve, romântico, fácil de amar.' },
    'nina ricci': { family: 'Floral Frutado', top: 'Maçã, pera', heart: 'Peônia, lírio', base: 'Almíscar, baunilha', blurb: 'Um clássico floral-frutado da maison francesa — delicado e atemporal.' },
    'ricci ricci nina ricci': { family: 'Floral Oriental', top: 'Framboesa, groselha', heart: 'Rosa, jasmim', base: 'Baunilha, âmbar, almíscar', blurb: 'Rosa envolta em veludo — o lado mais sensual e adulto da casa Nina Ricci.' },
    'la vie est belle': { family: 'Floral Frutado Gourmand', top: 'Groselha-preta, pera', heart: 'Íris, jasmim, flor de laranjeira', base: 'Praliné, baunilha, patchouli', blurb: '"A vida é bela" em forma líquida — doce, quente e inconfundível a metros de distância.' },
    'alien': { family: 'Floral Âmbar', top: 'Jasmim sambac', heart: 'Jasmim, madressilva', base: 'Âmbar branco, madeiras cashmeran', blurb: 'Denso e magnético — um floral âmbar que não pede licença para ocupar espaço.' },
    'meliora parfums de marly': { family: 'Floral Frutado', top: 'Framboesa, groselha-preta, lichia', heart: 'Rosa, ylang-ylang, chá de jasmim', base: 'Baunilha, almíscar, cedro', blurb: 'Jardim frutado ao amanhecer — otimista, jovem e romântico.' },
    'azzaro pour homme': { family: 'Fougère Aromático', top: 'Manjericão, bergamota, alecrim', heart: 'Alcaçuz, canela, cravo', base: 'Almíscar, sândalo, âmbar', blurb: 'O fougère francês definitivo — o cheiro de terno bem cortado e confiança tranquila.' },
    'legend montblanc': { family: 'Fougère Aromático', top: 'Lavanda, maçã, bergamota', heart: 'Gerânio, coumarina, cassis', base: 'Musgo de carvalho, tonka, sândalo', blurb: 'Elegância clássica reinventada — doce na medida certa, sofisticado sem esforço.' },
    'eternity fem': { family: 'Floral Aromático', top: 'Mandarina, lírio-do-vale, sálvia', heart: 'Lírio-tigre, jasmim, rosa', base: 'Âmbar, sândalo, almíscar', blurb: 'A promessa de compromisso da Calvin Klein — floral limpo, romântico, para sempre atual.' },
    'scandal gold': { family: 'Floral Âmbar Gourmand', top: 'Laranja-sangue, framboesa', heart: 'Mel, gardênia', base: 'Patchouli, baunilha, caramelo', blurb: 'Versão ainda mais dourada e intensa do escandaloso mel-e-patchouli da Jean Paul Gaultier.' },
    'scandal': { family: 'Floral Âmbar Gourmand', top: 'Laranja-sangue, groselha', heart: 'Mel, flor de laranjeira, gardênia', base: 'Patchouli, baunilha', blurb: 'Mel e patchouli em rota de colisão — doce, escuro e propositalmente provocador.' },
    '212 sexy': { family: 'Floral Almiscarado', top: 'Framboesa, pêssego', heart: 'Flor de laranjeira, jasmim', base: 'Almíscar, baunilha', blurb: 'A versão mais pele-a-pele da 212 — quente, sensual, feita para ficar perto.' },
    '212 vip rose': { family: 'Floral Frutado', top: 'Champanhe rosé, framboesa', heart: 'Flor de laranjeira, jasmim', base: 'Baunilha, âmbar', blurb: 'A festa nunca acaba nesta versão rosé — frutado espumante com fundo doce e âmbar.' },
    'giorgio armani si tradicional': { family: 'Chipre Frutado', top: 'Cassis, groselha-preta', heart: 'Rosa da Bulgária, framboesa', base: 'Patchouli, baunilha, âmbar', blurb: 'O "sim" da mulher contemporânea da Armani — frutado escuro com fundo cremoso.' },
    'j adore': { family: 'Floral Frutado', top: 'Pera, melão, magnólia', heart: 'Jasmim, rosa damascena, orquídea', base: 'Baunilha, cetona de framboesa', blurb: 'O buquê floral mais imitado do mundo — dourado, luminoso, absolutamente icônico.' },
    'good girl supreme': { family: 'Floral Amadeirado', top: 'Amêndoa, café, tuberosa', heart: 'Jasmim sambac, tuberosa', base: 'Cacau, favas tonka, baunilha', blurb: 'O contraste "anjo e demônio" da Carolina Herrera em versão ainda mais rica e gourmand.' },
    'fame blooming pink': { family: 'Floral Frutado', top: 'Framboesa, pera', heart: 'Peônia, jasmim', base: 'Almíscar, madeiras claras', blurb: 'A energia fashion da Fame em tom rosa — leve, doce e cheia de personalidade.' },
    'fame parfum': { family: 'Chipre Floral Amadeirado', top: 'Manga', heart: 'Jasmim puro', base: 'Incenso cremoso, almíscar', blurb: 'Fame na sua versão mais intensa — jasmim e incenso para quem não passa despercebida.' },
    'fame': { family: 'Chipre Floral Frutado', top: 'Manga, bergamota', heart: 'Jasmim puro', base: 'Sândalo, baunilha, incenso cremoso', blurb: 'O espírito da parisiense moderna — frutado, floral e cheio de atitude.' },
    'd addict': { family: 'Floral Oriental', top: 'Flor de laranjeira, magnólia', heart: 'Jasmim, tuberosa', base: 'Baunilha de Bourbon, benjoim', blurb: 'Baunilha e flor de laranjeira em dose viciante — sensual do primeiro ao último borrifo.' },
    'coco mademoiselle': { family: 'Chipre Oriental', top: 'Laranja, bergamota', heart: 'Rosa, jasmim, lichia', base: 'Patchouli, vetiver, baunilha', blurb: 'A face jovem da Chanel — chipre fresco por fora, sensual e amadeirado por dentro.' },
    'black xs for her': { family: 'Floral Frutado', top: 'Framboesa, groselha', heart: 'Rosa, violeta', base: 'Patchouli, baunilha', blurb: 'Rock, atitude e um floral frutado com uma pegada mais escura que o comum.' },
    'black xs masculino': { family: 'Amadeirado Especiado', top: 'Absinto, gengibre', heart: 'Especiarias, cardamomo', base: 'Cedro, âmbar', blurb: 'Energia noturna e rebelde — especiado, amadeirado, sem pedir desculpas.' },
    'polo blue ralph lauren': { family: 'Aromático Aquático', top: 'Melão, pepino, notas marinhas', heart: 'Gerânio, lavanda', base: 'Almíscar, cedro, musgo de carvalho', blurb: 'A liberdade do mar em versão engarrafada — fresco, limpo, americano até a alma.' },
    'eaudemoiselle': { family: 'Floral Frutado', top: 'Bergamota, groselha', heart: 'Rosa, jasmim', base: 'Almíscar branco, madeiras', blurb: 'Um floral parisiense leve e espirituoso — perfeito para as manhãs de sol.' },
    'invictus platinum': { family: 'Amadeirado Aquático', top: 'Grapefruit, mandarina', heart: 'Notas marinhas, lavanda', base: 'Ambroxan, guaiacol, patchouli', blurb: 'A vitória em versão platinada — mais metálico, mais intenso, mais competitivo.' },
    'toy 2 moschino': { family: 'Floral Frutado', top: 'Pera, bergamota', heart: 'Peônia, orquídea', base: 'Almíscar, madeiras claras', blurb: 'Divertido e brilhante como a embalagem em forma de robô — floral leve e otimista.' },
    'armani code': { family: 'Oriental Amadeirado', top: 'Limão, bergamota', heart: 'Flor de azahar, gerânio', base: 'Tonka, sândalo, couro guaiac', blurb: 'O código secreto da sedução italiana — quente, amadeirado, discretamente ousado.' },
    'fantasy': { family: 'Floral Frutado Gourmand', top: 'Maçã vermelha, algodão-doce', heart: 'Orquídea, jasmim', base: 'Creme de chantilly, almíscar', blurb: 'Doce e brincalhão como um parque de diversões — puro açúcar em forma de perfume.' },
    'chloe naturelle': { family: 'Floral Amadeirado', top: 'Groselha, pera', heart: 'Rosa, peônia', base: 'Âmbar, cedro, almíscar branco', blurb: 'Elegância francesa discreta — floral limpo com um fundo amadeirado macio.' },
    'light blue': { family: 'Frutado Cítrico', top: 'Limão siciliano, maçã verde, cedro', heart: 'Jasmim, rosa branca, bambu', base: 'Cedro, âmbar, almíscar', blurb: 'O verão da Sicília engarrafado — cítrico, crocante e instantaneamente reconhecível.' },
    'tom ford neroli portofino': { family: 'Cítrico Aromático', top: 'Neroli, limão, bergamota', heart: 'Lavanda, flor de laranjeira, angélica', base: 'Almíscar, âmbar', blurb: 'Costa Amalfitana em um frasco — cítrico, luminoso e caro dos pés à cabeça.' },
    'my way floral giorgio armani': { family: 'Floral Branco', top: 'Bergamota, flor de laranjeira', heart: 'Tuberosa, jasmim, orquídea', base: 'Almíscar branco, madeiras', blurb: 'A versão mais florida da jornada Armani — leve, luminosa, cheia de flores brancas.' },
    'my way giorgio armani': { family: 'Floral Branco', top: 'Bergamota, laranjeira', heart: 'Tuberosa, jasmim', base: 'Baunilha, madeira de cedro, almíscar branco', blurb: 'Um convite à liberdade — floral branco quente com um fundo suave de baunilha.' },
    'my way nacre': { family: 'Floral Branco Almiscarado', top: 'Flor de laranjeira, bergamota', heart: 'Tuberosa, jasmim, notas perolizadas', base: 'Almíscar branco, madeiras claras', blurb: 'My Way em edição perolada — o mesmo floral branco com um brilho ainda mais translúcido.' },
    'le male le parfum jean paul gaultier': { family: 'Oriental Amadeirado', top: 'Lavanda, baunilha', heart: 'Cardamomo, canela', base: 'Baunilha, fava tonka, madeiras', blurb: 'O marinheiro mais famoso da perfumaria em sua forma mais quente e concentrada.' },
    'idole intense': { family: 'Floral Amadeirado', top: 'Pera, bergamota', heart: 'Rosa, jasmim', base: 'Almíscar branco, patchouli, cedro', blurb: 'Rosa e almíscar em versão intensificada — moderno, forte, cheio de caráter.' },
    'ombre nomade': { family: 'Amadeirado Oriental', top: 'Oud, framboesa', heart: 'Rosa, açafrão, gerânio', base: 'Olíbano, benjoim', blurb: 'Oud e rosa em rota noturna — denso, quente, para quem gosta de deixar rastro.' },
    'ombre nom de': { family: 'Amadeirado Oriental', top: 'Oud, framboesa', heart: 'Rosa, açafrão, gerânio', base: 'Olíbano, benjoim', blurb: 'Oud e rosa em rota noturna — denso, quente, para quem gosta de deixar rastro.' },
    'ferrari black': { family: 'Amadeirado Aromático', top: 'Bergamota, pimenta-preta', heart: 'Lavanda, gerânio', base: 'Patchouli, madeiras, almíscar', blurb: 'Velocidade e adrenalina em forma amadeirada — direto, másculo, sem rodeios.' },
    '212 vip men club': { family: 'Amadeirado Especiado', top: 'Gengibre, cardamomo', heart: 'Vodka, couro', base: 'Baunilha, âmbar, madeiras', blurb: 'A balada nunca acaba — quente, doce e com uma pegada de couro discreta.' },
    'hypnose': { family: 'Floral Oriental', top: 'Framboesa, lichia', heart: 'Jasmim sambac, baunilha', base: 'Sândalo, âmbar', blurb: 'Um floral que hipnotiza de verdade — frutado no topo, quente e sedutor no fundo.' },
    'silver scent': { family: 'Fougère Aromático', top: 'Bergamota, lavanda, hortelã', heart: 'Gerânio, jasmim', base: 'Almíscar, sândalo, âmbar', blurb: 'Clássico aromático europeu — fresco, limpo, com aquele caráter "recém-saído do banho".' },
    'phantom': { family: 'Aromático Amadeirado', top: 'Bergamota, grapefruit rosa, lavanda', heart: 'Levístico, gerânio', base: 'Ambroxan, feno, baunilha', blurb: 'Inteligência artificial em forma de perfume — moderno, elétrico, viciantemente fresco.' },
    'club de nuit intense man': { family: 'Frutado Amadeirado', top: 'Limão, abacaxi, groselha-preta, maçã', heart: 'Bétula, jasmim, rosa', base: 'Âmbar cinzento, patchouli, almíscar, baunilha', blurb: 'O clone mais respeitado do mercado — potente, frutado e com uma trilha amadeirada longa.' },
    'ysl mon paris': { family: 'Floral Frutado', top: 'Morango silvestre, pera', heart: 'Peônia, jasmim', base: 'Patchouli, âmbar branco, baunilha', blurb: 'Uma declaração de amor a Paris — doce, floral e absolutamente romântico.' },
    'cloud ariana grande': { family: 'Floral Frutado Gourmand', top: 'Lavanda, pera, bergamota', heart: 'Coco, chantilly, praliné, orquídea baunilha', base: 'Almíscar, madeiras cremosas', blurb: 'Doce, aconchegante e etéreo como o nome sugere — a fragrância pop mais amada da geração.' },
    'ch tradicional': { family: 'Chipre Floral', top: 'Pêssego, melão, bergamota', heart: 'Jasmim, tuberosa', base: 'Âmbar, musgo de carvalho, almíscar', blurb: 'Um clássico latino atemporal — feminino, quente e inesquecível.' },
    'creed aventus': { family: 'Chipre Frutado', top: 'Abacaxi, groselha-preta, maçã, bergamota', heart: 'Bétula, patchouli, rosa', base: 'Almíscar, carvalho, âmbar', blurb: 'O ícone de sucesso da perfumaria moderna — frutado, fumado e inconfundivelmente confiante.' },
    'euphoria': { family: 'Oriental Frutado', top: 'Romã, framboesa', heart: 'Lótus negro, orquídea', base: 'Madeiras, âmbar, chocolate', blurb: 'Sedução em estado puro — frutado escuro sobre um fundo quente e misterioso.' },
    'pure xs': { family: 'Oriental Especiado', top: 'Mandarina, gengibre', heart: 'Jasmim, flor de laranjeira', base: 'Baunilha, âmbar, almíscar', blurb: 'Intensidade pura sem filtro — especiado no início, quente e viciante no fundo.' },
    'sauvage eau de parfum dior': { family: 'Amadeirado Aromático', top: 'Bergamota da Calábria, pimenta-de-sichuan', heart: 'Lavanda, geranium, elemi', base: 'Ambroxan, baunilha, patchouli', blurb: 'O selvagem mais usado do planeta — cítrico, especiado e com uma trilha amadeirada infinita.' },
    'sauvage elixir': { family: 'Amadeirado Especiado', top: 'Canela, especiarias, laranja-sanguínea', heart: 'Lavanda, noz-moscada', base: 'Tonka, baunilha, âmbar', blurb: 'O Sauvage mais concentrado e gourmand — para quem quer deixar rastro por horas.' },
    'joy': { family: 'Floral Chipre', top: 'Rosa, jasmim', heart: 'Rosa de maio, jasmim de Grasse', base: 'Sândalo, almíscar', blurb: 'Um floral de luxo clássico, opulento sem ser pesado — puro prazer em cada borrifada.' },
    'california dream': { family: 'Floral Frutado Solar', top: 'Coco, flor de laranjeira', heart: 'Jasmim, tiaré', base: 'Madeira de gaiac, almíscar', blurb: 'A Califórnia em forma de perfume compartilhável — tropical, solar e despretensiosamente elegante.' },
    'hipnotic poison': { family: 'Oriental Amendoado', top: 'Amêndoa amarga, baunilha', heart: 'Jasmim, tuberosa', base: 'Baunilha, sândalo, âmbar', blurb: 'Veneno doce e viciante — amêndoa e baunilha em uma combinação hipnótica de verdade.' },
    'burberry her': { family: 'Floral Frutado', top: 'Groselha-preta, framboesa, amora', heart: 'Violeta, jasmim', base: 'Âmbar, almíscar, madeiras', blurb: 'Londres em versão doce e urbana — frutado vermelho com um coração floral vibrante.' },
    'olympea solar': { family: 'Floral Âmbar Salgado', top: 'Mandarina verde, coco', heart: 'Flor de laranjeira, jasmim aquático', base: 'Baunilha salgada, âmbar', blurb: 'A energia solar da Olympéa — mesma base âmbar-salgada, com um toque tropical a mais.' },
    'rouge royal': { family: 'Oriental Especiado', top: 'Baga-rosa, cardamomo', heart: 'Rosa, cravo', base: 'Âmbar, madeiras, baunilha', blurb: 'Um oriental especiado com porte de realeza — quente, denso e cheio de presença.' },
    'classique jean paul gaultier': { family: 'Floral Oriental', top: 'Anis, rosa', heart: 'Flor de laranjeira, tuberosa', base: 'Baunilha, âmbar, madeiras', blurb: 'O torso de mulher mais icônico da perfumaria — floral quente, doce e eternamente sedutor.' },
};
