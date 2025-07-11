USE taller;
SET GLOBAL log_bin_trust_function_creators = 1;


DELIMITER $$
--
-- Funciones y procedimientos para TECNICO
--
DROP PROCEDURE IF EXISTS buscarTecnico$$
CREATE PROCEDURE buscarTecnico (_id INT, _idTecnico VARCHAR(15))
begin
    select * from tecnico where id = _id or idTecnico = _idTecnico;
end$$

DROP PROCEDURE IF EXISTS filtrarTecnico$$
CREATE PROCEDURE filtrarTecnico (
    _parametros varchar(250), -- %idTecnico%&%nombre%&%apellido1%&%apellido2%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
begin
    SELECT cadenaFiltro(_parametros, 'idTecnico&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT concat("SELECT * from tecnico where ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
end$$

DROP PROCEDURE IF EXISTS numRegsTecnico$$
CREATE PROCEDURE numRegsTecnico (
    _parametros varchar(250))
begin
    SELECT cadenaFiltro(_parametros, 'idTecnico&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT concat("SELECT count(id) from tecnico where ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
end$$

DROP FUNCTION IF EXISTS nuevoTecnico$$
CREATE FUNCTION nuevoTecnico (
    _idTecnico Varchar(15),
    _nombre Varchar (30),
    _apellido1 Varchar (15),
    _apellido2 Varchar (15),
    _telefono Varchar (9),
    _celular Varchar (9),
    _direccion Varchar (255),
    _correo Varchar (100))
    RETURNS INT(1) 
begin
    declare _cant int;
    select count(id) into _cant from tecnico where idTecnico = _idTecnico OR correo = _correo;
    if _cant < 1 then
        insert into tecnico(idTecnico, nombre, apellido1, apellido2, telefono, 
            celular, direccion, correo) 
            values (_idTecnico, _nombre, _apellido1, _apellido2, _telefono, 
            _celular, _direccion, _correo);
    end if;
    return _cant;
end$$

DROP FUNCTION IF EXISTS editarTecnico$$
CREATE FUNCTION editarTecnico (
    _id int, 
    _idTecnico Varchar(15),
    _nombre Varchar (30),
    _apellido1 Varchar (15),
    _apellido2 Varchar (15),
    _telefono Varchar (9),
    _celular Varchar (9),
    _direccion Varchar (255),
    _correo Varchar (100)
    ) RETURNS INT(1) 
begin
    declare _cant int;
    declare no_encontrado int default 0;
    if not exists(select id from tecnico where id = _id) then
        set no_encontrado = 1;
    else
        update tecnico set
            idTecnico = _idTecnico,
            nombre = _nombre,
            apellido1 = _apellido1,
            apellido2 = _apellido2,
            telefono = _telefono,
            celular = _celular,
            direccion = _direccion,
            correo = _correo
        where id = _id;
    end if;
    return no_encontrado;
end$$

DROP FUNCTION IF EXISTS eliminarTecnico$$
CREATE FUNCTION eliminarTecnico (_id INT(1)) RETURNS INT(1)
begin
    declare _cant int;
    declare _resp int;
    set _resp = 0;
    select count(id) into _cant from tecnico where id = _id;
    if _cant > 0 then
        set _resp = 1;
        delete from tecnico where id = _id;
    end if;
    return _resp;
end$$

-- Triggers para TECNICO

DROP TRIGGER IF EXISTS actualizar_Tecnico$$
CREATE TRIGGER actualizar_Tecnico AFTER UPDATE ON tecnico FOR EACH ROW
BEGIN
        UPDATE usuario
        SET idUsuario = NEW.idTecnico, 
            correo = NEW.correo
        WHERE idUsuario = OLD.idTecnico;
END$$

DROP TRIGGER IF EXISTS eliminar_Tecnico$$
CREATE TRIGGER eliminar_Tecnico AFTER DELETE ON tecnico FOR EACH ROW
BEGIN
    DELETE FROM usuario
    WHERE idUsuario = OLD.idTecnico;
END$$

DELIMITER ;
