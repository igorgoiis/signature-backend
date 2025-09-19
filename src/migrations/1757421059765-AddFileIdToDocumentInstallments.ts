import {
  ForeignKey,
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddFileIdToDocumentInstallments1757421059765
  implements MigrationInterface
{
  private readonly tableName = "document_installments";
  private readonly column = new TableColumn({
    name: "file_id",
    type: "int",
    isNullable: true,
  });

  private readonly fk = new TableForeignKey({
    name: "FK_DOCUMENT_INSTALLMENT_FILE",
    columnNames: ["file_id"],
    referencedTableName: "files",
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    await queryRunner.addColumn(this.tableName, this.column);
    await queryRunner.createForeignKey(this.tableName, this.fk);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    await queryRunner.dropForeignKey(this.tableName, this.fk);
    await queryRunner.dropColumn(this.tableName, this.column);
  }
}
