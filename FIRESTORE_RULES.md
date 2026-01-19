# Firestore Taisyklės (Rules)

## Development režimas (visiems leidžiama)

Jei naudojate development režimą ir norite, kad visi turėtų prieigą prie duomenų, naudokite šias taisykles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Transakcijos
    match /transactions/{document=**} {
      allow read, write: if true;
    }
    
    // Biudžetai
    match /budgets/{document=**} {
      allow read, write: if true;
    }
    
    // Periodinės transakcijos
    match /recurring/{document=**} {
      allow read, write: if true;
    }
    
    // Finansų tikslai
    match /goals/{document=**} {
      allow read, write: if true;
    }
    
    // Skolos (jei naudojate)
    match /debts/{document=**} {
      allow read, write: if true;
    }
    
    // Kategorijos
    match /categories/{document=**} {
      allow read, write: if true;
    }
    
    // Santaupų sąskaitos
    match /savingsAccounts/{document=**} {
      allow read, write: if true;
    }
    
    // Santaupų transakcijos
    match /savingsTransactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Production režimas (su autentifikacija)

Jei naudojate production režimą, naudokite šias taisykles su autentifikacija ir userId tikrinimu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funkcija, kuri patikrina, ar vartotojas prisijungęs
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Funkcija, kuri patikrina, ar vartotojas yra dokumento savininkas
    function isOwner() {
      return isAuthenticated() && request.auth.uid == resource.data.userId;
    }
    
    // Funkcija, kuri patikrina, ar vartotojas kuria savo dokumentą
    function isCreatingOwn() {
      return isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }
    
    // Transakcijos
    match /transactions/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Biudžetai
    match /budgets/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Periodinės transakcijos
    match /recurring/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Finansų tikslai
    match /goals/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Skolos (jei naudojate)
    match /debts/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Kategorijos
    match /categories/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Santaupų sąskaitos
    match /savingsAccounts/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
    
    // Santaupų transakcijos
    match /savingsTransactions/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isCreatingOwn();
      allow update, delete: if isOwner();
    }
  }
}
```

## Kaip įdiegti taisykles

1. Eikite į [Firebase Console](https://console.firebase.google.com/)
2. Pasirinkite savo projektą
3. Eikite į **Firestore Database** → **Rules** (kairėje meniu)
4. Nukopijuokite vieną iš aukščiau pateiktų taisyklių
5. Spauskite **Publish** (Publikuoti)

## Svarbu!

⚠️ **Development taisyklės (`if true`) yra tik testavimui!** 
- Jomis gali naudotis bet kas, kas turi jūsų Firebase konfigūraciją
- **NIEKADA** nenaudokite jų production aplinkoje su realiais duomenimis
- Production režime **VISADA** naudokite autentifikaciją

## Troubleshooting

Jei vis dar kyla problemų:

1. **Patikrinkite, ar taisyklės išsaugotos**: Firebase Console → Firestore → Rules
2. **Patikrinkite, ar nėra sintaksės klaidų**: Firebase Console parodys raudoną klaidą, jei yra
3. **Patikrinkite, ar naudojate teisingą Firebase projektą**: `src/firebase/config.ts`
4. **Patikrinkite, ar sukurti composite index'ai**: Žiūrėkite `FIRESTORE_INDEXES.md`
5. **Išvalykite naršyklės cache** ir bandykite dar kartą

## Svarbu apie Index'us

Kai naudojate `where` su `orderBy`, Firestore reikalauja composite index. Jei gausite `failed-precondition` klaidą, reikia sukurti index. Žiūrėkite `FIRESTORE_INDEXES.md` dėl daugiau informacijos.
