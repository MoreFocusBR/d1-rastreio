import { NotaFiscal, NFE, NotaFiscalGet, NotaFiscalCreate, NotaFiscalRepository } from "../intefaces/nota-fiscal.interface";
import { NotaFiscalRepositoryPrisma } from "../repositories/nf.repository";
class NfeUseCase {
    private notaFiscalRepository : NotaFiscalRepository;
    constructor(){
        this.notaFiscalRepository = new NotaFiscalRepositoryPrisma()
    }

    async create({Codigo, CodigoVenda }: NotaFiscalCreate): Promise<NotaFiscal>{
        const result = await this.notaFiscalRepository.create({Codigo, CodigoVenda});
        return result;
    }

    async get({CodigoVenda }: NotaFiscalGet): Promise<NFE>{
        const result = await this.notaFiscalRepository.get({CodigoVenda});
        return result;
    }
}   
export {NfeUseCase};