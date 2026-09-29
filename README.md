# CRUD de instrumentos

Aplicación web sencilla en JavaScript para administrar la tabla `instrumentos` de la base de datos MySQL `ARINC429_6A`. Incluye una interfaz en el navegador y una API REST implementada con Express.

## Requisitos

- Node.js 18 o superior y npm.
- Un servidor MySQL en ejecución.
- La base `ARINC429_6A` y la tabla `instrumentos` ya creadas, con estas columnas: `ins_id INT PRIMARY KEY AUTO_INCREMENT` e `ins_descripcion VARCHAR(50)`.
- Un usuario MySQL con permisos `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre esa tabla.

El proyecto no crea ni modifica bases de datos, tablas o columnas.

## Instalación y configuración

En PowerShell, desde la carpeta del proyecto:

```powershell
Copy-Item .env.example .env
```

Edita `.env` con la dirección de tu servidor y tus credenciales MySQL. `DB_NAME` debe ser `ARINC429_6A`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_NAME=ARINC429_6A
PORT=3000
```

Instala las dependencias y ejecuta el servidor:

```powershell
npm install
npm start
```

Abre <http://localhost:3000>. El servidor necesita poder conectarse a MySQL y encontrar la tabla existente; si falla la conexión o la consulta, revisa `.env`, los permisos y que el servidor MySQL esté activo.

## Operaciones disponibles

- `GET /api/instrumentos`: lista todos los instrumentos.
- `GET /api/instrumentos/:id`: consulta un instrumento.
- `POST /api/instrumentos`: crea uno con `ins_descripcion`.
- `PUT /api/instrumentos/:id`: modifica su descripción.
- `DELETE /api/instrumentos/:id`: elimina el registro.

La descripción se recorta en los extremos y debe tener entre 1 y 50 caracteres. Las consultas a MySQL usan parámetros preparados.

## Probar el CRUD y verificar MySQL

Con el servidor activo, puedes usar la página para crear un instrumento, editarlo y eliminarlo. También puedes probar la API desde otra ventana de PowerShell:

```powershell
$base = 'http://localhost:3000/api/instrumentos'

# Crear y conservar el ID asignado por MySQL
$instrumento = Invoke-RestMethod -Method Post -Uri $base -ContentType 'application/json' -Body (@{ ins_descripcion = 'Prueba CRUD' } | ConvertTo-Json)
$instrumento

# Consultar el registro creado
Invoke-RestMethod -Method Get -Uri "$base/$($instrumento.ins_id)"

# Listar todos los registros
Invoke-RestMethod -Method Get -Uri $base

# Modificar el registro
Invoke-RestMethod -Method Put -Uri "$base/$($instrumento.ins_id)" -ContentType 'application/json' -Body (@{ ins_descripcion = 'Prueba CRUD editada' } | ConvertTo-Json)

# Eliminarlo
Invoke-RestMethod -Method Delete -Uri "$base/$($instrumento.ins_id)"
```

Para confirmar directamente que las operaciones persistieron, conéctate a MySQL usando las mismas credenciales y ejecuta esta consulta después de crear o modificar:

```sql
USE ARINC429_6A;
SELECT ins_id, ins_descripcion FROM instrumentos ORDER BY ins_id;
```

Después de borrar el registro de prueba, vuelve a ejecutar el `SELECT` y comprueba que ya no aparece. La aplicación solo lee y modifica registros de `instrumentos`; no cambia su estructura.
