export interface NotaFiscal{
        id : number;
        codigo : number;
        codigoVenda : number;
        codigoCliente : number;
        dataEmissao : Date;
        horaEmissao : Date;
        horaSaida : Date;
        nFe : boolean;
        nFCe : boolean;
        notaFiscalNumero : number;
        transportadoraCodigo : number;
        transportadoraNome : string;
        meioTransporte : string;
        numeroObjeto : string;
        notaFiscalEletronica : string;
        cancelada : boolean;
        motivoCancelamento : string;
    
}

export interface NFE{
    nfe : NotaFiscal[];
}

export interface NotaFiscalGet{
    codigoVenda : number;
}

export interface NotaFiscalCreate{
    codigo : number;
    codigoVenda : number;
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