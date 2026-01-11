# Finansų Valdymo Programa

Išplėsta finansų valdymo aplikacija su Firestore integracija.

## Funkcijos

### Pagrindinės funkcijos
- ✅ Pajamų ir išlaidų fiksavimas su datomis
- ✅ Išlaidų kategorijos: būstas, mokesčiai, maistas, drabužiai, automobilis, pramogos, sveikata, grožis, kitos
- ✅ Pajamų ir išlaidų statistika (savaitė, mėnuo, metai)
- ✅ Mėnesio likučio rodymas
- ✅ Firestore integracija

### Išplėstos funkcijos
- ✅ **Transakcijų redagavimas** - galimybė redaguoti bet kurią transakciją
- ✅ **Paieška ir filtravimas** - filtruoti pagal tipą, kategoriją, datą, paieška pagal aprašymą
- ✅ **Grafikai ir vizualizacijos** - pie chart, bar chart, line chart
- ✅ **CSV eksportas** - eksportuoti transakcijas į CSV formatą
- ✅ **Biudžeto valdymas** - nustatyti biudžetus kategorijoms su įspėjimais
- ✅ **Periodinės transakcijos** - automatinis transakcijų sukūrimas (kasdien, kas savaitę, kas mėnesį, kasmet)
- ✅ **Duomenų importas/eksportas** - visų duomenų atsarginės kopijos JSON formatu
- ✅ **Temos keitimas** - šviesi/tamsi tema
- ✅ **Kelių valiutų palaikymas** - EUR, USD, GBP, PLN
- ✅ **Finansų tikslai** - tikslo nustatymas ir sekimas su progresu
- ✅ **Gautinos ir skolos** - sekimas, kas skoluojasi ir kam skoluojasi
- ✅ **Kalendorių peržiūra** - transakcijų vizualizacija kalendoriuje
- ✅ **Nustatymai** - tema, duomenų valdymas

## Įdiegimas

1. Įdiekite priklausomybes:
```bash
npm install
```

2. Konfigūruokite Firestore:
   - Atidarykite `src/firebase/config.ts`
   - Pakeiskite Firebase konfigūracijos duomenis su savo Firebase projekto duomenimis
   - Firebase konfigūraciją galite rasti Firebase Console → Project Settings → General → Your apps

3. Paleiskite programą:
```bash
npm run dev
```

## Firebase nustatymai

1. Eikite į [Firebase Console](https://console.firebase.google.com/)
2. Sukurkite naują projektą arba pasirinkite esamą
3. Eikite į Project Settings → General
4. Raskite "Your apps" sekciją ir pasirinkite Web (</>)
5. Nukopijuokite konfigūracijos objektą ir įdėkite į `src/firebase/config.ts`

## Firestore taisyklės

Užtikrinkite, kad Firestore turi šias taisykles (development režime):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
    match /budgets/{document=**} {
      allow read, write: if true;
    }
    match /recurring/{document=**} {
      allow read, write: if true;
    }
    match /goals/{document=**} {
      allow read, write: if true;
    }
    match /debts/{document=**} {
      allow read, write: if true;
    }
    match /categories/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Dėmesio:** Produkcinėje aplinkoje naudokite tinkamas saugumo taisykles su autentifikacija!

## Naudojamos technologijos

- React 18
- TypeScript
- Vite
- Tailwind CSS (su dark mode)
- Firebase Firestore
- date-fns
- Recharts (grafikai)

## Projekto struktūra

```
src/
├── components/          # React komponentai
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── EditTransactionModal.tsx
│   ├── Statistics.tsx
│   ├── Balance.tsx
│   ├── SearchAndFilter.tsx
│   ├── Charts.tsx
│   ├── BudgetManager.tsx
│   ├── RecurringTransactions.tsx
│   ├── FinancialGoals.tsx
│   ├── DebtsManager.tsx
│   ├── CalendarView.tsx
│   └── Settings.tsx
├── services/           # Firestore servisai
│   └── firestoreService.ts
├── hooks/             # Custom hooks
│   └── useTheme.ts
├── utils/             # Utility funkcijos
│   ├── exportCSV.ts
│   ├── importExport.ts
│   └── currency.ts
├── types/             # TypeScript tipai
│   └── index.ts
└── firebase/          # Firebase konfigūracija
    └── config.ts
```

## Naudojimas

### Transakcijų valdymas
- Pridėti naują transakciją: Užpildykite formą "Transakcijos" skirtuke
- Redaguoti: Spauskite pieštuko piktogramą transakcijos eilutėje
- Ištrinti: Spauskite šiukšliadėžės piktogramą

### Statistika
- Peržiūrėti grafikus ir statistiką "Statistika" skirtuke
- Pasirinkti laikotarpį: savaitė, mėnuo, metai

### Biudžeto valdymas
- Nustatyti biudžetus kategorijoms "Biudžetas" skirtuke
- Sekti biudžeto viršijimus

### Periodinės transakcijos
- Pridėti periodinę transakciją "Periodinės" skirtuke
- Sistema automatiškai sukurs transakcijas pagal dažnį

### Finansų tikslai
- Nustatyti finansų tikslus "Tikslai" skirtuke
- Sekti progresą ir kiek lieka iki tikslo

### Skolos ir gautinos
- Valdyti skolas "Skolos" skirtuke
- Pažymėti kaip sumokėtas/grąžintas

### Duomenų valdymas
- Eksportuoti CSV: "Nustatymai" → "Eksportuoti CSV"
- Eksportuoti visus duomenis: "Nustatymai" → "Eksportuoti visus duomenis"
- Importuoti: "Nustatymai" → "Importuoti duomenis"

### Tema
- Keisti temą: "Nustatymai" → pasirinkti šviesią arba tamsią temą

## Pastabos

- Visi duomenys saugomi Firebase Firestore
- Duomenys sinchronizuojami automatiškai
- Kalendorius rodo transakcijas su spalvomis (mėlyna = yra transakcijų)
- Grafikai atnaujinami automatiškai keičiant filtro laikotarpį
