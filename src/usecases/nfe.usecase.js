"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfeUseCase = void 0;
const nf_repository_1 = require("../repositories/nf.repository");
class NfeUseCase {
    constructor() {
        this.notaFiscalRepository = new nf_repository_1.NotaFiscalRepositoryPrisma();
    }
    async create({ Codigo, CodigoVenda }) {
        const result = await this.notaFiscalRepository.create({ Codigo, CodigoVenda });
        return result;
    }
    async get({ CodigoVenda }) {
        const result = await this.notaFiscalRepository.get({ CodigoVenda });
        return result;
    }
}
exports.NfeUseCase = NfeUseCase;
