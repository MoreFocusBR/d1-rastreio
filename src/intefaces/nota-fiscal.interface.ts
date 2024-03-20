export interface NotaFiscal {
    Id : number;
    Codigo : number;
    CodigoVenda : number;
    CodigoCliente : number;
    DataEmissao : Date;
    HoraEmissao : Date;
    HoraSaida : Date;
    NFe : boolean;
    NFce : boolean;
    NotaFiscalNumero : number;
    TransportadoraCodigo : number;
    TransportadoraNome : string;
    MeioTransporte : string;
    NumeroObjeto : string;
    NotaFiscalEletronica : string;
    Cancelada : boolean;
    MotivoCancelamento : string;
}

export interface NFE{
    Nfe : NotaFiscal[];
}

export interface NotaFiscalGet{
    CodigoVenda : number;
}

export interface NotaFiscalCreate{
    Codigo : number;
    CodigoVenda : number;
    //codigoCliente : number;
    //dataEmissao : Date;
    //horaEmissao : Date;
    //horaSaida : Date;
    //nFe : boolean;
    //nFCe : boolean;
    //notaFiscalNumero : number;
    //transportadoraCodigo : number;
    //transportadoraNome : string;
    //meioTransporte : string;
    //numeroObjeto : string;
    //notaFiscalEletronica : string;
    //cancelada : boolean;
    //motivoCancelamento : string;
}

export interface NotaFiscalRepository{
    get(data: NotaFiscalGet): Promise<NFE>
    create(data: NotaFiscalCreate): Promise<NotaFiscal>;
}