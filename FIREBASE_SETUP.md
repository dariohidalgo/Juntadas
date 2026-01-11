# Configuración de Firebase para Android

Para que el login de Google funcione en la aplicación Android, necesitas completar estos pasos:

## 1. Descargar google-services.json

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **juntadas-73888**
3. En el menú lateral, haz clic en el ícono de engranaje ⚙️ > **Project Settings**
4. Baja hasta la sección **Your apps**
5. Si no tienes una app Android registrada:
   - Haz clic en **Add app** > **Android**
   - Android package name: `com.juntadas.app`
   - App nickname: `Juntadas` (opcional)
   - Haz clic en **Register app**
6. Descarga el archivo `google-services.json`
7. Coloca el archivo en: `d:\app gastos\eternal-expanse\android\app\google-services.json`

## 2. Obtener SHA-1 Fingerprint

El SHA-1 es necesario para que Google Sign-In funcione. Para obtenerlo:

### Opción A: Usando Android Studio (Recomendado)
1. Abre Android Studio con el proyecto (`npx cap open android`)
2. En el panel derecho, haz clic en **Gradle** (o ve a View > Tool Windows > Gradle)
3. Navega a: **android > Tasks > android > signingReport**
4. Haz doble clic en **signingReport**
5. En la consola verás algo como:
   ```
   Variant: debug
   Config: debug
   Store: C:\Users\dario\.android\debug.keystore
   Alias: AndroidDebugKey
   MD5: XX:XX:XX...
   SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
   SHA-256: ...
   ```
6. Copia el valor de **SHA1**

### Opción B: Usando línea de comandos
Ejecuta en PowerShell:
```powershell
cd "d:\app gastos\eternal-expanse\android"
.\gradlew.bat signingReport
```

## 3. Agregar SHA-1 a Firebase

1. Ve a Firebase Console > Project Settings > Your apps
2. Encuentra tu app Android
3. Baja hasta **SHA certificate fingerprints**
4. Haz clic en **Add fingerprint**
5. Pega el SHA-1 que copiaste
6. Haz clic en **Save**

## 4. Habilitar Google Sign-In en Firebase

1. En Firebase Console, ve a **Authentication** (menú lateral)
2. Haz clic en la pestaña **Sign-in method**
3. Busca **Google** en la lista de proveedores
4. Si no está habilitado:
   - Haz clic en **Google**
   - Activa el toggle **Enable**
   - Haz clic en **Save**

## 5. Rebuild y Probar

Una vez completados los pasos anteriores:

```bash
npm run build
npx cap sync
npx cap open android
```

En Android Studio:
- **Build > Build APK(s)**
- Instala el APK en tu dispositivo
- Prueba el login de Google

## Solución de Problemas

**Error: "Developer Error" o código 10**
- Verifica que el SHA-1 esté correctamente agregado en Firebase Console
- Asegúrate de que `google-services.json` esté en `android/app/`
- Haz un clean build: En Android Studio > Build > Clean Project > Build > Rebuild Project

**El login no hace nada**
- Verifica que Google Sign-In esté habilitado en Firebase Console
- Revisa los logs de Android Studio (Logcat) para ver errores específicos
