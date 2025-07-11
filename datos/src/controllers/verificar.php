<?php
$hash = password_hash("123456", PASSWORD_BCRYPT, ['cost' => 10]);
echo "Nuevo hash:\n$hash\n";
