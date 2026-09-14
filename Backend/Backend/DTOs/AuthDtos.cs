namespace TiendaApi.DTOs;

public record LoginDto(string Usuario, string Password);

public record LoginResponseDto(string Token, DateTime ExpiraEn);
