USE taller;
SET GLOBAL log_bin_trust_function_creators = 1;
DELIMITER $$


DROP PROCEDURE IF EXISTS buscarAdmin$$
CREATE PROCEDURE buscarAdmin (_id INT, _idAdmin VARCHAR(15))
BEGIN
    SELECT * FROM admin WHERE id = _id OR idAdmin = _idAdmin;
END$$

DROP PROCEDURE IF EXISTS filtrarAdministrador$$
CREATE PROCEDURE filtrarAdministrador (
    _parametros VARCHAR(250), -- %idAdmin%&%nombre%&%apellido1%&%apellido2%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    SELECT cadenaFiltro(_parametros, 'idAdmin&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT * FROM admin WHERE ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$


DROP PROCEDURE IF EXISTS filtrarAdmin$$
CREATE PROCEDURE filtrarAdmin (
    _parametros varchar(250), -- %idAdmin%&%nombre%&%apellido1%&%apellido2%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
begin
    SELECT cadenaFiltro(_parametros, 'idAdmin&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT concat("SELECT * from admin where ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
end$$


DROP PROCEDURE IF EXISTS numRegsAdmin$$
CREATE PROCEDURE numRegsAdmin (
    _parametros VARCHAR(250))
BEGIN
    SELECT cadenaFiltro(_parametros, 'idAdmin&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT COUNT(id) FROM admin WHERE ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP FUNCTION IF EXISTS nuevoAdmin$$
CREATE FUNCTION nuevoAdmin (
    _idAdmin VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _correo VARCHAR(100))
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    SELECT COUNT(id) INTO _cant FROM admin WHERE idAdmin = _idAdmin OR correo = _correo;
    IF _cant < 1 THEN
        INSERT INTO admin(idAdmin, nombre, apellido1, apellido2, telefono, celular, correo)
        VALUES (_idAdmin, _nombre, _apellido1, _apellido2, _telefono, _celular, _correo);
    END IF;
    RETURN _cant;
END$$

DROP FUNCTION IF EXISTS editarAdmin$$
CREATE FUNCTION editarAdmin (
    _id INT, 
    _idAdmin VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _correo VARCHAR(100))
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE no_encontrado INT DEFAULT 0;
    IF NOT EXISTS(SELECT id FROM admin WHERE id = _id) THEN
        SET no_encontrado = 1;
    ELSE
        UPDATE admin SET
            idAdmin = _idAdmin,
            nombre = _nombre,
            apellido1 = _apellido1,
            apellido2 = _apellido2,
            telefono = _telefono,
            celular = _celular,
            correo = _correo
        WHERE id = _id;
    END IF;
    RETURN no_encontrado;
END$$

DROP FUNCTION IF EXISTS eliminarAdmin$$
CREATE FUNCTION eliminarAdmin (_id INT(1)) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    SET _resp = 0;
    SELECT COUNT(id) INTO _cant FROM admin WHERE id = _id;
    IF _cant > 0 THEN
        SET _resp = 1;
        DELETE FROM admin WHERE id = _id;
    END IF;
    RETURN _resp;
END$$

-- Triggers (si necesitas para usuario, descomenta y adapta)
 DROP TRIGGER IF EXISTS actualizar_Admin$$
CREATE TRIGGER actualizar_Admin AFTER UPDATE ON admin FOR EACH ROW
BEGIN
     UPDATE usuario
     SET idUsuario = NEW.idAdmin, 
         correo = NEW.correo
     WHERE idUsuario = OLD.idAdmin;
 END$$

 DROP TRIGGER IF EXISTS eliminar_Admin$$
 CREATE TRIGGER eliminar_Admin AFTER DELETE ON admin FOR EACH ROW
 BEGIN
     DELETE FROM usuario
     WHERE idUsuario = OLD.idAdmin;
 END$$

DELIMITER ;
