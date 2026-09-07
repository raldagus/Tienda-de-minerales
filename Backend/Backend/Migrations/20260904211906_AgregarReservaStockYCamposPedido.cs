using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarReservaStockYCamposPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CalibreMn",
                table: "Productos",
                newName: "CalibreMm");

            migrationBuilder.AddColumn<string>(
                name: "ColorTag",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StockReservado",
                table: "Productos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Variedad",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "Productos",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<string>(
                name: "Canal",
                table: "Pedidos",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "WhatsApp");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaExpiracion",
                table: "Pedidos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "NumeroPedido",
                table: "Pedidos",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Producto_StockReservado_Max",
                table: "Productos",
                sql: "\"StockReservado\" <= \"Stock\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Producto_StockReservado_NoNegativo",
                table: "Productos",
                sql: "\"StockReservado\" >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_NumeroPedido",
                table: "Pedidos",
                column: "NumeroPedido",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Producto_StockReservado_Max",
                table: "Productos");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Producto_StockReservado_NoNegativo",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_NumeroPedido",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "ColorTag",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "StockReservado",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Variedad",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "xmin",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Canal",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "FechaExpiracion",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "NumeroPedido",
                table: "Pedidos");

            migrationBuilder.RenameColumn(
                name: "CalibreMm",
                table: "Productos",
                newName: "CalibreMn");
        }
    }
}
