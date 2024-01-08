type InformacoesContrato = {
    dadosPessoais: {
        nome: string;
        dataNascimento: string;
        cpf: string;
        nacionalidade: string;
        estadoCivil: string;
        nomeMae: string;
        dataBase: string;
    };
    endereco: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;

    };
    referenciasPessoais: {
        nomeReferencia: string;

    }[];
    dadosProfissionais: {
        categoria: string;
        cargo: string;
        empresa: string;
        renda: string;
    };

};
