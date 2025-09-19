import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateFornecedoresTable1755441684464
  implements MigrationInterface
{
  private readonly table = new Table({
    name: "fornecedores",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "codigo",
        type: "varchar",
        isUnique: true,
      },
      {
        name: "cpf_cnpj",
        type: "varchar",
        length: "14",
        isUnique: true,
      },
      {
        name: "razao_social",
        type: "varchar",
      },
      {
        name: "nome_fantasia",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "now()",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "now()",
      },
      {
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      },
    ],
  });

  private readonly tableCodigoIndex = new TableIndex({
    name: "IDX_FORNECEDOR_CODIGO",
    columnNames: ["codigo"],
    isUnique: true,
  });

  private readonly tableCpfCnpjIndex = new TableIndex({
    name: "IDX_FORNECEDOR_CPF_CNPJ",
    columnNames: ["cpf_cnpj"],
    isUnique: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table, this.tableCodigoIndex);
    await queryRunner.createIndex(this.table, this.tableCpfCnpjIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.table, this.tableCodigoIndex);
    await queryRunner.dropIndex(this.table, this.tableCpfCnpjIndex);
    await queryRunner.dropTable(this.table);
  }
}
