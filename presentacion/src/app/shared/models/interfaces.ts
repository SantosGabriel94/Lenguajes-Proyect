export interface TipoCliente {
  id?: number,
  idCliente: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string,
  fechaIngreso: string
};

export interface TipoAdmin {
  id?: number;
  idAdmin: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  telefono: string;
  celular: string;
  correo: string;
}

export interface TipoOficinista {
  id?: number,
  idOficinista: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoTecnico {
  id?: number,
  idTecnico: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoArtefacto {
  id?: number,
  idCliente: string,
  serie: string,
  marca: string,
  modelo: string,
  categoria: string,
  descripcion: string
}

export interface TipoCaso {
  id?: number;
  idTecnico: string;
  idCreador: string;
  idArtefacto: string; //serie del artefacto
  descripcion: string;
  fechaEntrada: string;
  fechaSalida?: string;
  // Campos adicionales casos específicos
  codigoArtefacto?: string; // Serie del artefacto
  estadoActual?: number; // Estado numérico actual
  estadoTexto?: string; // Estado en texto legible
  ultimaActualizacion?: string; // Fecha de última actualización 
}

export interface TipoHistorial {
  id?: number;
  idCaso: number;
  idResponsable: string;
  estado: number;
  fechaCambio: string;
  descripcion: string;
}

export interface IToken {
  token : string;
  tkRef : string;
}