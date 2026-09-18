export interface LoginApiDto {
  usuario: string;
  password: string;
}

export interface LoginResponseApiDto {
  token: string;
  expiraEn: string;
}
