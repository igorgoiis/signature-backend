import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from './fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedorService {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
  ) {}

  async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    const { codigo, cnpj, razaoSocial, nomeFantasia } = createFornecedorDto;

    // Verificar se fornecedor com mesmo código já existe
    const existingByCodigo = await this.fornecedorRepository.findOne({ where: { codigo } });
    if (existingByCodigo) {
      throw new BadRequestException(`Fornecedor com código "${codigo}" já existe.`);
    }

    // Verificar se fornecedor com mesmo CNPJ já existe
    const existingByCnpj = await this.fornecedorRepository.findOne({ where: { cnpj } });
    if (existingByCnpj) {
      throw new BadRequestException(`Fornecedor com CNPJ "${cnpj}" já existe.`);
    }

    const fornecedor = this.fornecedorRepository.create({
      codigo,
      cnpj,
      razaoSocial,
      nomeFantasia
    });

    return this.fornecedorRepository.save(fornecedor);
  }

  async findAll(): Promise<Fornecedor[]> {
    return this.fornecedorRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.findOne({ where: { id } });
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }
    return fornecedor;
  }

  async update(id: number, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
    // Busca o fornecedor existente ou lança NotFoundException
    const fornecedor = await this.findOne(id);

    const { codigo, cnpj, razaoSocial, nomeFantasia } = updateFornecedorDto;

    // Verificar se o novo código já está em uso por outro fornecedor
    if (codigo && codigo !== fornecedor.codigo) {
      const existingByCodigo = await this.fornecedorRepository.findOne({ where: { codigo } });
      if (existingByCodigo) {
        throw new BadRequestException(`Fornecedor com código "${codigo}" já existe.`);
      }
    }

    // Verificar se o novo CNPJ já está em uso por outro fornecedor
    if (cnpj && cnpj !== fornecedor.cnpj) {
      const existingByCnpj = await this.fornecedorRepository.findOne({ where: { cnpj } });
      if (existingByCnpj) {
        throw new BadRequestException(`Fornecedor com CNPJ "${cnpj}" já existe.`);
      }
    }

    // Atualiza os campos se fornecidos
    if (codigo) fornecedor.codigo = codigo;
    if (cnpj) fornecedor.cnpj = cnpj;
    if (razaoSocial) fornecedor.razaoSocial = razaoSocial;
    if (nomeFantasia !== undefined) fornecedor.nomeFantasia = nomeFantasia;

    return this.fornecedorRepository.save(fornecedor);
  }

  async remove(id: number): Promise<void> {
    const result = await this.fornecedorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }
  }

  async search(query: string): Promise<Fornecedor[]> {
    if (!query || query.trim().length === 0) {
      return this.findAll();
    }

    const searchTerm = `%${query.trim()}%`;
    
    return this.fornecedorRepository
      .createQueryBuilder('fornecedor')
      .where('fornecedor.codigo ILIKE :searchTerm', { searchTerm })
      .orWhere('fornecedor.cnpj ILIKE :searchTerm', { searchTerm })
      .orWhere('fornecedor.razaoSocial ILIKE :searchTerm', { searchTerm })
      .orWhere('fornecedor.nomeFantasia ILIKE :searchTerm', { searchTerm })
      .orderBy('fornecedor.createdAt', 'DESC')
      .getMany();
  }
}