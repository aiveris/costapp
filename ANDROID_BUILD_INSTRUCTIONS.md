# Android APK Build Instrukcijos

## Reikalingi įrankiai

1. **Node.js** - jau turite ✓
2. **Java JDK 11 arba naujesnė versija** - reikalinga Android build
3. **Android Studio** - rekomenduojama (bet ne būtina, jei naudosite komandinę eilutę)

## Kaip sukurti APK failą

### Metodas 1: Naudojant Android Studio (Rekomenduojama)

1. **Atidarykite Android projektą:**
   ```bash
   npm run cap:open:android
   ```
   Tai atidarys Android Studio su jūsų projektu.

2. **Android Studio:**
   - Palaukite, kol Gradle sync baigsis
   - Eikite į **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Palaukite build proceso
   - APK bus sukurtas: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Instaliuoti telefone:**
   - Nukopijuokite `app-debug.apk` į savo Android telefoną
   - Telefone eikite į **Nustatymai → Saugumas** ir įjunkite **"Leisti diegti iš nežinomų šaltinių"**
   - Atidarykite APK failą telefone ir instaliuokite

### Metodas 2: Naudojant komandinę eilutę (Windows PowerShell)

**Reikia turėti įdiegtą Android SDK ir Gradle.**

1. **Sukurkite Debug APK:**
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```
   
   APK bus sukurtas: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Sukurkite Release APK (reikia keystore):**
   ```bash
   .\gradlew.bat assembleRelease
   ```

### Atnaujinimas po web kodo pakeitimų

Kiekvieną kartą, kai pakeičiate web kodą ir norite atnaujinti APK:

```bash
# 1. Build web aplikaciją
npm run build

# 2. Sync su Android projektu
npm run cap:sync

# 3. Tada vėl sukurkite APK (Android Studio arba gradlew)
```

Arba vienu veiksmu:
```bash
npm run cap:sync
```

## Keystore sukūrimas (Release versijai)

Jei norite sukurti pasirašytą Release APK (reikalinga Google Play Store):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore costapp-release-key.keystore -alias costapp -keyalg RSA -keysize 2048 -validity 10000
```

Tada konfigūruokite `android/app/build.gradle` su signing config.

## Problema sprendimas

### "Gradle not found"
- Įdiekite Android Studio arba Android SDK
- Arba pridėkite Gradle į PATH

### "Java not found"
- Įdiekite Java JDK 11 arba naujesnę versiją
- Nustatykite JAVA_HOME environment variable

### Build klaidos
- Atidarykite Android Studio ir palaukite Gradle sync
- Patikrinkite, ar visi dependencies yra įdiegti

## Greitas kelias (Debug APK)

1. `npm run build`
2. `npm run cap:sync`
3. `npm run cap:open:android`
4. Android Studio: **Build → Build APK(s)**
5. Raskite APK: `android/app/build/outputs/apk/debug/app-debug.apk`
6. Nukopijuokite į telefoną ir instaliuokite
