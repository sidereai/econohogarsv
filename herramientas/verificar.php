<?php
/**
 * EconoHogar · diagnóstico del servidor
 *
 * Responde de una sola vez todo lo que falta confirmar del hosting.
 * No contiene contraseñas: las de la base se escriben en el formulario y
 * viajan por POST, así no quedan en el historial ni en los registros del
 * servidor.
 *
 * Uso:
 *   1. Cambiar TOKEN por cualquier texto propio.
 *   2. Subir a public_html/
 *   3. Abrir https://econohogarsv.com/verificar.php?t=EL_TOKEN
 *   4. BORRARLO del servidor al terminar.
 */

const TOKEN = 'cambiar-esto';

if (!hash_equals(TOKEN, $_GET['t'] ?? '')) {
    http_response_code(404);
    exit('No encontrado');
}

/** Puerto abierto en la propia máquina: dice si el servicio es local. */
function puertoLocal(int $puerto): array
{
    $inicio = microtime(true);
    $con = @fsockopen('127.0.0.1', $puerto, $err, $msg, 3);
    $ms = (int) round((microtime(true) - $inicio) * 1000);
    if ($con) {
        fclose($con);
        return [true, "responde en {$ms} ms"];
    }
    return [false, trim($msg) !== '' ? $msg : 'sin respuesta'];
}

function fila(string $q, $valor, ?bool $ok = null, string $nota = ''): void
{
    $clase = $ok === null ? '' : ($ok ? 'ok' : 'mal');
    $marca = $ok === null ? '' : ($ok ? '✓' : '✗');
    echo '<tr class="' . $clase . '"><td>' . htmlspecialchars($q) . '</td>'
       . '<td>' . $marca . ' ' . htmlspecialchars((string) $valor) . '</td>'
       . '<td>' . htmlspecialchars($nota) . "</td></tr>\n";
}

// --------------------------------------------------------------
$phpOk   = version_compare(PHP_VERSION, '8.1', '>=');
$subidas = sys_get_temp_dir();
$rutaSub = __DIR__ . '/uploads';
$puedeEscribir = is_dir($rutaSub) ? is_writable($rutaSub) : is_writable(__DIR__);

[$pgLocal, $pgNota] = puertoLocal(5432);
[$myLocal, $myNota] = puertoLocal(3306);

$extensiones = [
    'pdo'       => 'Capa de base de datos',
    'pdo_pgsql' => 'Sin esto PHP no habla con PostgreSQL',
    'gd'        => 'Redimensionado de fotos de producto',
    'mbstring'  => 'Texto con acentos',
    'fileinfo'  => 'Validar el tipo real de las fotos subidas',
    'openssl'   => 'HTTPS y firmas',
    'curl'      => 'Llamadas salientes',
];
?>
<!doctype html>
<meta charset="utf-8">
<title>Diagnóstico · EconoHogar</title>
<style>
  body{font:15px/1.6 system-ui,sans-serif;max-width:860px;margin:30px auto;padding:0 18px;color:#101a21}
  h1{font-size:1.5rem;margin:0 0 4px} h2{font-size:1.05rem;margin:28px 0 8px}
  p.sub{color:#5a6a75;margin:0 0 20px}
  table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:10px}
  td{padding:7px 10px;border-bottom:1px solid #dfe6ea;vertical-align:top}
  td:first-child{width:34%;color:#2c3a44} td:nth-child(2){width:33%;font-weight:600}
  td:last-child{color:#5a6a75;font-size:13px}
  tr.ok td:nth-child(2){color:#1d7348} tr.mal td:nth-child(2){color:#a8241d}
  .aviso{background:#fbefda;border-left:4px solid #9a5e00;padding:12px 14px;margin:18px 0;font-size:14px}
  form{background:#f3f6f7;border:1px solid #dfe6ea;border-radius:8px;padding:16px;margin-top:10px}
  input{font:inherit;padding:7px 9px;border:1px solid #c7d2d8;border-radius:5px;width:100%;margin-bottom:9px}
  button{font:inherit;font-weight:600;background:#12506e;color:#fff;border:0;border-radius:5px;padding:9px 18px;cursor:pointer}
</style>

<h1>Diagnóstico del servidor</h1>
<p class="sub"><?= htmlspecialchars(gethostname()) ?> · <?= date('Y-m-d H:i') ?></p>

<div class="aviso"><b>Borrar este archivo del servidor al terminar.</b>
Expone información del hosting que no tiene por qué ser pública.</div>

<h2>PHP</h2>
<table>
<?php
fila('Versión de PHP', PHP_VERSION, $phpOk, $phpOk ? '' : 'Se necesita 8.1 o superior');
fila('Interfaz', PHP_SAPI);
fila('Servidor web', $_SERVER['SERVER_SOFTWARE'] ?? 'desconocido');
fila('HTTPS', empty($_SERVER['HTTPS']) ? 'no' : 'sí', !empty($_SERVER['HTTPS']),
     'El panel no puede pedir contraseña sin HTTPS');
fila('Zona horaria', date_default_timezone_get(), date_default_timezone_get() === 'America/El_Salvador',
     'Debería ser America/El_Salvador');
fila('Memoria', ini_get('memory_limit'));
fila('Subida máxima', ini_get('upload_max_filesize') . ' / POST ' . ini_get('post_max_size'),
     null, 'Una foto de celular pesa entre 2 y 6 MB');
fila('Tiempo máximo', ini_get('max_execution_time') . ' s');
fila('Carpeta del sitio', __DIR__);
fila('Se puede escribir', $puedeEscribir ? 'sí' : 'no', $puedeEscribir, 'Para guardar las fotos');
?>
</table>

<h2>Extensiones</h2>
<table>
<?php
foreach ($extensiones as $ext => $para) {
    $hay = extension_loaded($ext);
    fila($ext, $hay ? 'instalada' : 'FALTA', $hay, $para);
}
if (extension_loaded('gd')) {
    $gd = gd_info();
    fila('GD · WebP', !empty($gd['WebP Support']) ? 'sí' : 'no',
         !empty($gd['WebP Support']), 'WebP pesa menos que JPEG');
}
?>
</table>

<h2>¿La base está en esta misma máquina?</h2>
<table>
<?php
fila('PostgreSQL en 127.0.0.1:5432', $pgLocal ? 'sí' : 'no', $pgLocal, $pgNota);
fila('MySQL en 127.0.0.1:3306', $myLocal ? 'sí' : 'no', null, $myNota);
?>
</table>
<?php if (!$pgLocal): ?>
<div class="aviso">PostgreSQL no responde en esta máquina. La aplicación tendría
que conectarse por red a otro servidor, lo que cambia la configuración y obliga
a cifrar la conexión.</div>
<?php endif; ?>

<h2>Conexión a la base</h2>
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<table>\n";
    try {
        $dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s',
            $_POST['host'] ?: '127.0.0.1', (int) ($_POST['puerto'] ?: 5432), $_POST['base']);
        $db = new PDO($dsn, $_POST['usuario'], $_POST['clave'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        fila('Conexión', 'establecida', true);
        foreach ([
            'Versión'        => 'SHOW server_version',
            'Codificación'   => 'SHOW server_encoding',
            'Cotejamiento'   => 'SHOW lc_collate',
        ] as $q => $sql) {
            fila($q, $db->query($sql)->fetchColumn());
        }
        $esp = $db->query("SELECT count(*) FROM pg_ts_config WHERE cfgname='spanish'")->fetchColumn();
        fila('Búsqueda en español', $esp ? 'disponible' : 'no', (bool) $esp);

        $trgm = $db->query("SELECT count(*) FROM pg_available_extensions WHERE name='pg_trgm'")->fetchColumn();
        fila('pg_trgm disponible', $trgm ? 'sí' : 'no', null,
             'Opcional: tolerancia a errores de escritura');

        $crear = $db->query('SELECT has_schema_privilege(current_user, \'public\', \'CREATE\')')->fetchColumn();
        fila('Puede crear tablas', $crear ? 'sí' : 'no', (bool) $crear);

        $tablas = $db->query("SELECT count(*) FROM pg_tables WHERE schemaname='public'")->fetchColumn();
        fila('Tablas ya creadas', $tablas, null, $tablas > 0 ? 'La base no está vacía' : '');
    } catch (Throwable $e) {
        fila('Conexión', 'falló', false, $e->getMessage());
    }
    echo "</table>\n";
}
?>
<form method="post">
  <p style="margin:0 0 10px;font-size:13.5px;color:#5a6a75">
    Los datos viajan por POST y no se guardan en ningún lado.</p>
  <input name="host"    placeholder="Servidor (127.0.0.1)" value="127.0.0.1">
  <input name="puerto"  placeholder="Puerto (5432)" value="5432">
  <input name="base"    placeholder="Base de datos" value="econohog_master">
  <input name="usuario" placeholder="Usuario">
  <input name="clave"   type="password" placeholder="Contraseña">
  <button type="submit">Probar conexión</button>
</form>
