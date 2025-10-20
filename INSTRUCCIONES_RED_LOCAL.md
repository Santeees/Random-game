# Instrucciones para Juego Multijugador en Red Local

## Configuración del Servidor (Computadora Host)

### 1. Obtener la IP Local

Para que otros dispositivos puedan conectarse, necesitas conocer la IP local de tu computadora:

**En Windows:**
```bash
ipconfig
```
Busca la línea "Dirección IPv4" en tu adaptador de red activo (WiFi o Ethernet).
Ejemplo: `192.168.1.100`

**En macOS/Linux:**
```bash
ifconfig
```
Busca la dirección IP en la interfaz activa (en0 para WiFi, eth0 para Ethernet).

### 2. Iniciar el Servidor

1. Abre una terminal en el directorio del proyecto
2. Ejecuta los siguientes comandos:

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor backend
npm run server:dev

# En otra terminal, iniciar el frontend
npm run client:dev
```

3. El servidor estará disponible en:
   - **Frontend:** `http://[TU_IP]:5173`
   - **Backend:** `http://[TU_IP]:3001`

Ejemplo: Si tu IP es `192.168.1.100`, el juego estará en `http://192.168.1.100:5173`

### 3. Configurar Firewall (Importante)

Asegúrate de que los puertos estén abiertos en tu firewall:

**Windows:**
1. Busca "Firewall de Windows Defender" en el menú inicio
2. Haz clic en "Permitir una aplicación o característica a través del Firewall de Windows Defender"
3. Permite Node.js y tu navegador web en redes privadas

**Alternativamente, abre los puertos específicos:**
- Puerto 5173 (Frontend)
- Puerto 3001 (Backend)

## Conexión desde Otros Dispositivos

### 1. Requisitos
- Todos los dispositivos deben estar en la **misma red WiFi/LAN**
- Conocer la IP del servidor host
- Tener un navegador web moderno

### 2. Conectarse al Juego

1. En cualquier dispositivo de la red, abre un navegador web
2. Navega a: `http://[IP_DEL_SERVIDOR]:5173`
   
   Ejemplo: `http://192.168.1.100:5173`

3. Ingresa tu nombre de jugador
4. ¡Listo para jugar!

### 3. Solución de Problemas

**Si no puedes conectarte:**

1. **Verifica la IP:** Asegúrate de usar la IP correcta del servidor
2. **Verifica la red:** Todos los dispositivos deben estar en la misma red
3. **Firewall:** Revisa que el firewall no esté bloqueando las conexiones
4. **Puertos:** Verifica que los puertos 5173 y 3001 estén disponibles

**Comandos útiles para diagnóstico:**

```bash
# Verificar si el servidor está escuchando
netstat -an | findstr :5173
netstat -an | findstr :3001

# Hacer ping al servidor desde otro dispositivo
ping [IP_DEL_SERVIDOR]
```

## Ejemplo de Configuración Completa

### Servidor (IP: 192.168.1.100)
```bash
# Terminal 1 - Backend
npm run server:dev
# Salida: Server ready on port 3001 and accessible from network

# Terminal 2 - Frontend  
npm run client:dev
# Salida: Local: http://localhost:5173/
#         Network: http://192.168.1.100:5173/
```

### Clientes
- **Dispositivo 1:** Navegar a `http://192.168.1.100:5173`
- **Dispositivo 2:** Navegar a `http://192.168.1.100:5173`
- **Dispositivo 3:** Navegar a `http://192.168.1.100:5173`
- **Dispositivo 4:** Navegar a `http://192.168.1.100:5173`

## Notas Importantes

- **Máximo 4 jugadores** por sesión
- **Mínimo 2 jugadores** para iniciar una partida
- El **primer jugador** que se conecta se convierte en el **host** y puede iniciar la partida
- Si el servidor se desconecta, todos los jugadores perderán la conexión
- Para mejores resultados, usa una **conexión WiFi estable**

## Características del Juego

- **10 minijuegos diferentes** seleccionados aleatoriamente
- **Sistema de puntuación:** 1 punto por victoria en cada minijuego
- **Resultados en tiempo real** después de cada minijuego
- **Clasificación final** al completar los 10 minijuegos
- **Interfaz responsive** que funciona en móviles y computadoras

¡Disfruta jugando con tus amigos en la red local! 🎮