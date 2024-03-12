"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfeUseCase = void 0;
const nf_repository_1 = require("../repositories/nf.repository");
class NfeUseCase {
    constructor() {
        this.notaFiscalRepository = new nf_repository_1.NotaFiscalRepositoryPrisma();
    }
    async create({ codigo, codigoVenda }) {
        const result = await this.notaFiscalRepository.create({ codigo, codigoVenda });
        return result;
    }
    async get({ codigoVenda }) {
        const result = await this.notaFiscalRepository.get({ codigoVenda });
        return result;
    }
}
exports.NfeUseCase = NfeUseCase;
