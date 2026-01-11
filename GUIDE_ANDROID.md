# Guia para Generar APK Android

Hemos configurado el proyecto para ser compatible con Android usando **Capacitor**.

Debido a que tu aplicación usa Next.js, se han realizado las siguientes modificaciones:
1.  Se habilitó `output: 'export'` en `next.config.ts` para generar archivos estáticos.
2.  Se refactorizaron las páginas dinámicas (`group/[id]`, etc.) para separar la lógica de cliente y permitir la exportación estática.

## Pasos para generar el APK

### 1. Preparar los archivos (ya realizado, pero útil para futuras referencias)
Cada vez que hagas cambios en el código de tu app, debes ejecutar:

```bash
npm run build
npx cap sync
```

### 2. Abrir en Android Studio
Para compilar la aplicación y generar el archivo APK, necesitas Android Studio. Ejecuta el siguiente comando en la terminal:

```bash
npx cap open android
```

Esto abrirá Android Studio con tu proyecto cargado.

### 3. Generar el APK
Una vez en Android Studio:
1.  Espera a que termine de sincronizarse (Gradle sync).
2.  Ve al menú **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3.  Cuando termine, aparecerá una notificación ("APK(s) generated successfully"). Haz clic en **locate** para abrir la carpeta donde está el archivo `.apk` (normalmente `android/app/build/outputs/apk/debug/app-debug.apk`).

### 4. Instalar en tu teléfono
Transfiere ese archivo `.apk` a tu teléfono y ejecútalo para instalar la aplicación.

## Solución de Problemas

*   **Licencias**: Si al ejecutar comandos ves errores de licencias, abrir Android Studio y dejar que instale los SDK necesarios suele solucionarlo.
*   **Rutas Dinámicas**: Si añades nuevas páginas dinámicas (con `[id]`), asegúrate de seguir el patrón de `app/group/[id]/page.tsx`: crear un componente cliente y envolverlo en una página servidor que exporte `generateStaticParams`.
