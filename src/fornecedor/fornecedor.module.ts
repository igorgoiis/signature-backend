import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FornecedorService } from "./fornecedor.service";
import { FornecedorController } from "./fornecedor.controller";
import { Fornecedor } from "./entities/fornecedor.entity";
import {
  IsCodigoUniqueConstraint,
  IsCpfCnpjUniqueConstraint,
} from "./validators/unique-validators";

@Module({
  imports: [TypeOrmModule.forFeature([Fornecedor])],
  controllers: [FornecedorController],
  providers: [
    FornecedorService,
    IsCodigoUniqueConstraint,
    IsCpfCnpjUniqueConstraint,
  ],
  exports: [FornecedorService],
})
export class FornecedorModule {}
