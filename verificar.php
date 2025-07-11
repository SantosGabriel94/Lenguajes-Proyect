<?php
$hash = '$2y$10$ESKQUzCbEEOqx9z6e01JWeYOgRXmMnHoLtDAD6JvOW8MxF7roGN0W'; // tu hash actual
$input = '123456'; // contraseña a verificar

if (password_verify($input, $hash)) {
    echo "✅ Coincide";
} else {
    echo " No coincide";
}
