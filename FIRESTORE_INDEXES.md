# Firestore Composite Index Reikalavimai

## Apie Composite Index

Kai naudojate `where` su `orderBy` užklausas, Firestore reikalauja composite index. Jei index trūksta, gausite `failed-precondition` klaidą.

## Reikalingi Index'ai

### 1. Transactions Collection
**Collection ID:** `transactions`
**Fields:**
- `userId` (Ascending)
- `date` (Descending)

**Kaip sukurti:**
1. Eikite į [Firebase Console](https://console.firebase.google.com/)
2. Pasirinkite savo projektą
3. Eikite į **Firestore Database** → **Indexes**
4. Spauskite **Create Index**
5. Pasirinkite collection: `transactions`
6. Pridėkite laukus:
   - Field: `userId`, Order: `Ascending`
   - Field: `date`, Order: `Descending`
7. Spauskite **Create**

### 2. Savings Transactions Collection
**Collection ID:** `savingsTransactions`
**Fields:**
- `userId` (Ascending)
- `date` (Descending)

**Kaip sukurti:**
1. Eikite į **Firestore Database** → **Indexes**
2. Spauskite **Create Index**
3. Pasirinkite collection: `savingsTransactions`
4. Pridėkite laukus:
   - Field: `userId`, Order: `Ascending`
   - Field: `date`, Order: `Descending`
5. Spauskite **Create**

## Automatinis Index Sukūrimas

Kai pirmą kartą naudojate užklausą, kuri reikalauja index, Firestore automatiškai parodys klaidą su nuoroda į index sukūrimą. Spauskite ant nuorodos ir index bus sukurtas automatiškai.

## Troubleshooting

Jei vis dar kyla problemų:

1. **Patikrinkite, ar index sukurtas:**
   - Firebase Console → Firestore → Indexes
   - Patikrinkite, ar yra index su teisingais laukais

2. **Patikrinkite, ar index yra "Enabled":**
   - Index gali užtrukti kelias minutes, kol bus sukurtas
   - Palaukite, kol index status bus "Enabled"

3. **Patikrinkite, ar naudojate teisingus laukų vardus:**
   - `userId` (ne `user_id` ar kitas variantas)
   - `date` (ne `timestamp` ar kitas variantas)

4. **Išvalykite naršyklės cache** ir bandykite dar kartą
