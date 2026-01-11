# Juntadas - Expo App Build Guide

## ✅ App Completada

La app está lista con todas las funcionalidades esenciales:
- Login con Google
- Dashboard con lista de grupos
- Crear nuevo grupo
- Ver detalles del grupo (gastos, deudas, balances)
- Agregar nuevo gasto
- Editar/eliminar gastos

## 🚀 Cómo Generar el APK

### Opción 1: Desarrollo Local (Recomendado para testing)

1. **Instalar Expo Go en tu teléfono:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   
2. **Iniciar el servidor de desarrollo:**
   ```bash
   cd "d:/app gastos/eternal-expanse/juntadas-expo"
   npm start
   ```

3. **Escanear el código QR** con Expo Go para probar la app

### Opción 2: Build APK con EAS (Para distribución)

1. **Instalar EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login en Expo:**
   ```bash
   eas login
   ```

3. **Configurar el proyecto:**
   ```bash
   cd "d:/app gastos/eternal-expanse/juntadas-expo"
   eas build:configure
   ```

4. **Generar APK:**
   ```bash
   eas build --platform android --profile preview
   ```

5. El APK se generará en la nube y recibirás un link para descargarlo

### Opción 3: Build Local (Sin cuenta Expo)

1. **Generar build local:**
   ```bash
   cd "d:/app gastos/eternal-expanse/juntadas-expo"
   npx expo run:android
   ```

2. Esto requiere:
   - Android Studio instalado
   - Android SDK configurado
   - Emulador o dispositivo conectado

## 📱 Testing

### Probar en Expo Go (Más rápido)
```bash
cd "d:/app gastos/eternal-expanse/juntadas-expo"
npm start
```

Luego escanea el QR con Expo Go.

**Nota:** Google Sign-In puede no funcionar en Expo Go. Para probarlo, necesitas generar un APK.

### Probar APK en dispositivo real

1. Genera el APK con EAS o build local
2. Transfiere el APK a tu teléfono
3. Instala y prueba

## 🔧 Configuración Actual

- **Package:** `com.juntadas.app`
- **Firebase:** Configurado con `google-services.json`
- **Routing:** Expo Router (file-based)
- **Contexts:** Auth, Data, Language, Subscription

## 📂 Estructura del Proyecto

```
juntadas-expo/
├── app/
│   ├── _layout.tsx          # Root layout con providers
│   ├── login.tsx            # Pantalla de login
│   ├── (tabs)/
│   │   └── index.tsx        # Dashboard
│   ├── new-group.tsx        # Crear grupo
│   └── group/
│       ├── [id].tsx         # Detalles del grupo
│       ├── [id]/
│       │   ├── new-expense.tsx
│       │   └── edit-expense/
│       │       └── [expenseId].tsx
├── context/                 # Contexts migrados
├── lib/
│   └── firebase.ts          # Firebase config
├── google-services.json     # Firebase Android config
└── app.json                 # Expo config
```

## 🎯 Próximos Pasos

1. **Probar en Expo Go** para verificar funcionalidad básica
2. **Generar APK** con EAS para probar Google Sign-In
3. **Ajustar UI** si es necesario
4. **Publicar** en Google Play Store (opcional)

## ⚠️ Notas Importantes

- El Google Sign-In requiere un APK real (no funciona en Expo Go)
- Asegúrate de que el SHA-1 del APK esté en Firebase Console
- Para producción, usa `eas build --platform android --profile production`
