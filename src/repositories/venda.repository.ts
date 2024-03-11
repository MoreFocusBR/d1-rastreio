import { Venda, VendaCreate, VendaGet, VendaRepository, Vendas } from "../intefaces/venda.interface";

class VendaRepositoryPrisma implements VendaRepository{
    async get(data: VendaGet): Promise<Vendas> {
        throw new Error("Method not implemented.");
    }
    async create(data: VendaCreate): Promise<Venda> {
        throw new Error("Method not implemented.");
    }

}

export {VendaRepositoryPrisma};