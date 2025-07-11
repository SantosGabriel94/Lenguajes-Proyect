<?php
namespace App\controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class ServicioCURL{
    private const URL = "http://webdatos/api";
    
    // Método para extraer el token JWT de la petición
    protected function extraerToken($request){
        $authHeader = $request->getHeader('Authorization');
        if (!empty($authHeader)) {
            $authHeaderString = $authHeader[0];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeaderString, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
    
    // Método para validar si el token JWT ha expirado
    private function validarToken($token){
        if ($token === null) {
            return ['valido' => false, 'expirado' => false, 'razon' => 'Token no proporcionado'];
        }
        
        try {
            $secretKey = '365892IHJNSMLLZJHWkilssssaKHSIO'; // La misma clave que en datos
            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            
            // Verificar si el token ha expirado
            if (isset($decoded->exp) && $decoded->exp < time()) {
                return ['valido' => false, 'expirado' => true, 'razon' => 'Token expirado', 'datos' => $decoded];
            }
            
            return ['valido' => true, 'expirado' => false, 'datos' => $decoded];
            
        } catch (ExpiredException $e) {
            // El token está expirado pero podemos extraer los datos para refresh
            try {
                $decoded = JWT::decode($token, new Key($secretKey, 'HS256'), ['verify_exp' => false]);
                return ['valido' => false, 'expirado' => true, 'razon' => 'Token expirado', 'datos' => $decoded];
            } catch (\Exception $e) {
                return ['valido' => false, 'expirado' => true, 'razon' => 'Token expirado e inválido'];
            }
        } catch (\Exception $e) {
            return ['valido' => false, 'expirado' => false, 'razon' => 'Token inválido'];
        }
    }
    
    // Método para intentar refrescar token automáticamente
    private function intentarRefreshToken($tokenExpirado, $endPoint){
        if (!isset($tokenExpirado['datos']) || !isset($tokenExpirado['datos']->sub)) {
            return null;
        }
        
        // Solo intentar refresh si no estamos ya en un endpoint de auth
        if (strpos($endPoint, '/auth') === 0) {
            return null;
        }
        
        // Aquí deberías implementar la lógica para obtener el refresh token
        // Por ejemplo, desde una cookie, localStorage, etc.
        // Por ahora retornamos null para que maneje el frontend
        return null;
    }
    
    public function ejecutarCURL($endPoint, $metodo, $datos = null, $token = null, $validarToken = true){
        // Validar token si se requiere y hay token presente
        if ($validarToken && $token !== null) {
            $validacion = $this->validarToken($token);
            
            if (!$validacion['valido']) {
                if ($validacion['expirado']) {
                    // Token expirado - intentar refresh automático
                    $nuevoToken = $this->intentarRefreshToken($validacion, $endPoint);
                    
                    if ($nuevoToken === null) {
                        // No se pudo refrescar - devolver error específico de token expirado
                        return [
                            'resp' => json_encode([
                                'error' => 'Token expirado',
                                'codigo' => 'TOKEN_EXPIRED',
                                'mensaje' => 'Por favor, actualiza tu sesión'
                            ]), 
                            'status' => 401
                        ];
                    } else {
                        // Usar el nuevo token
                        $token = $nuevoToken;
                    }
                } else {
                    // Token inválido por otra razón
                    return [
                        'resp' => json_encode([
                            'error' => $validacion['razon'],
                            'codigo' => 'TOKEN_INVALID'
                        ]), 
                        'status' => 401
                    ];
                }
            }
        }
        
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, self::URL . $endPoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Configurar headers
        $headers = ['Content-Type: application/json'];
        
        // Si hay token, agregarlo al header Authorization
        if($token !== null){
            $headers[] = 'Authorization: Bearer ' . $token;
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if($datos!= null){
            curl_setopt($ch, CURLOPT_POSTFIELDS, $datos);
        }
        
        switch($metodo){
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                break;
            case 'PUT':
            case 'PATCH':
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);
                break;
            default:
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                
        }
        $resp= curl_exec($ch);
        $status= curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['resp'=> $resp, 'status' => $status];
    }
}