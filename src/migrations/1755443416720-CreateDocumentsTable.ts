import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateDocumentsTable1755443416720 implements MigrationInterface {
  private readonly table = new Table({
    name: "documents",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "title",
        type: "varchar",
        length: "255",
      },
      {
        name: "description",
        type: "text",
        isNullable: true,
      },
      {
        name: "file_path",
        type: "varchar",
        length: "500",
      },
      {
        name: "file_name",
        type: "varchar",
        length: "255",
      },
      {
        name: "file_size",
        type: "bigint",
      },
      {
        name: "mime_type",
        type: "varchar",
        length: "100",
      },
      {
        name: "file_hash",
        type: "varchar",
        length: "64",
        isUnique: true,
      },
      {
        name: "tipo_documento",
        type: "varchar",
        length: "255",
        default: "'GENERAL'",
      },
      {
        name: "natureza",
        type: "varchar",
        length: "255",
      },
      {
        name: "status",
        type: "varchar",
        length: "255",
        default: "'PENDING'",
      },
      {
        name: "valor",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      },
      {
        name: "data_vencimento",
        type: "date",
        isNullable: true,
      },
      {
        name: "observacoes",
        type: "text",
        isNullable: true,
      },
      {
        name: "owner_id",
        type: "int",
        isNullable: true,
      },
      {
        name: "fornecedor_id",
        type: "int",
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

  private readonly documentFileHashIndex = new TableIndex({
    name: "IDX_DOCUMENT_FILE_HASH",
    columnNames: ["file_hash"],
    isUnique: true,
  });

  private readonly documentStatusIndex = new TableIndex({
    name: "IDX_DOCUMENT_STATUS",
    columnNames: ["status"],
  });

  private readonly documentOwnerForeignKey = new TableForeignKey({
    name: "FK_DOCUMENT_OWNER",
    columnNames: ["owner_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });

  private readonly documentFornecedorForeignKey = new TableForeignKey({
    name: "FK_DOCUMENT_FORNECEDOR",
    columnNames: ["fornecedor_id"],
    referencedTableName: "fornecedores",
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table, this.documentFileHashIndex);
    await queryRunner.createIndex(this.table, this.documentStatusIndex);
    await queryRunner.createForeignKey(
      this.table,
      this.documentOwnerForeignKey,
    );
    await queryRunner.createForeignKey(
      this.table,
      this.documentFornecedorForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table, this.documentOwnerForeignKey);
    await queryRunner.dropForeignKey(
      this.table,
      this.documentFornecedorForeignKey,
    );
    await queryRunner.dropIndex(this.table, this.documentFileHashIndex);
    await queryRunner.dropIndex(this.table, this.documentStatusIndex);
    await queryRunner.dropTable(this.table);
  }
}
