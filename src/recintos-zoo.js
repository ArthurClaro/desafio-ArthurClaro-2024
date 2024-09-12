const especies = {
    LEAO: { tamanho: 3, biomas: ["savana"], carnivoro: true },
    LEOPARDO: { tamanho: 2, biomas: ["savana"], carnivoro: true },
    CROCODILO: { tamanho: 3, biomas: ["rio"], carnivoro: true },
    MACACO: { tamanho: 1, biomas: ["savana", "floresta"], carnivoro: false },
    GAZELA: { tamanho: 2, biomas: ["savana"], carnivoro: false },
    HIPOPOTAMO: { tamanho: 4, biomas: ["savana", "rio"], carnivoro: false }
};

const recintos = [
    { numero: 1, bioma: ["savana"], tamanho: 10, animais: [{ especie: "MACACO", quantidade: 3 }] },
    { numero: 2, bioma: ["floresta"], tamanho: 5, animais: [] },
    { numero: 3, bioma: ["savana", "rio"], tamanho: 7, animais: [{ especie: "GAZELA", quantidade: 1 }] },
    { numero: 4, bioma: ["rio"], tamanho: 8, animais: [] },
    { numero: 5, bioma: ["savana"], tamanho: 9, animais: [{ especie: "LEAO", quantidade: 1 }] }
];

class RecintosZoo {

    normalizeSpecies = (spacie) => {
        return spacie.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    };

    calculateOccupiedSpace = (animals) => {
        let space = 0;
        for (const { especie, quantidade } of animals) {
            const especieNormalizada = this.normalizeSpecies(especie);
            if (!especies[especieNormalizada]) {
                throw new Error(`Espécie desconhecida: ${especieNormalizada}`);
            }
            space += especies[especieNormalizada].tamanho * quantidade;
        }
        if (animals.length > 1) space += 1; 
        return space;
    };

    biomeCompatible = (especie, bioma) => {
        const filterBiomeCompatible = bioma.filter(element => especie.biomas.includes(element))
        return filterBiomeCompatible.length > 0
    };

    analisaRecintos(especie, quantidade) {
        especie = this.normalizeSpecies(especie);

        if (!especies[especie]) return { erro: "Animal inválido" };
        if (quantidade <= 0 || !Number.isInteger(quantidade)) return { erro: "Quantidade inválida" };

        const animalsInfos = especies[especie];
        const recintosViaveis = [];

        for (const recinto of recintos) {

            if (!recinto.bioma.some(b => this.biomeCompatible(animalsInfos, recinto.bioma))) continue;

            const existAnimaisRecinto = recinto.animais.length
            const animaisCarnivorosNoRecinto = recinto.animais.some(a => especies[this.normalizeSpecies(a.especie)].carnivoro);

            if (existAnimaisRecinto) {
                if (animalsInfos.carnivoro != animaisCarnivorosNoRecinto) continue
            }

            const biomaSavanaRio = recinto.bioma.includes("savana") && recinto.bioma.includes("rio")

            if (especie === "HIPOPOTAMO" && !biomaSavanaRio) continue;

            if (especie === "MACACO") {
                const macacosNoRecinto = recinto.animais.find(a => this.normalizeSpecies(a.especie) === "MACACO");
                if (quantidade === 1 && !macacosNoRecinto) continue; 
                if (macacosNoRecinto && macacosNoRecinto.quantidade + quantidade < 2) continue; 
            }

            const existEspecieDiferente = recinto.animais.some(elementt => elementt.especie != especie)

            const espacoOcupadoAtual = this.calculateOccupiedSpace(recinto.animais);
            const espacoNecessario = existEspecieDiferente ? (animalsInfos.tamanho * quantidade) + 1 : (animalsInfos.tamanho * quantidade);

            if (espacoNecessario > (recinto.tamanho - espacoOcupadoAtual)) continue;

            const espacoLivreFinal = recinto.tamanho - (espacoOcupadoAtual + espacoNecessario);

            if (espacoLivreFinal >= 0) {
                recintosViaveis.push(`Recinto ${recinto.numero} (espaço livre: ${espacoLivreFinal} total: ${recinto.tamanho})`);
            }
        }

        recintosViaveis.sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));

        if (recintosViaveis.length === 0) return { erro: "Não há recinto viável" };

        return { recintosViaveis };
    }
}

export { RecintosZoo as RecintosZoo };