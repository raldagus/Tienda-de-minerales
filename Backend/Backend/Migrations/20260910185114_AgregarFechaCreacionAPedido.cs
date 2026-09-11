using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarFechaCreacionAPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Los pedidos nuevos setean FechaCreacion desde la app (TiendaDbContext).
            // defaultValueSql "now()" solo cubre el backfill de filas existentes y
            // evita el DateTime(Kind=Unspecified) contra una columna timestamptz.
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Pedidos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Pedidos");
        }
    }
}
