# Automatinis Deploy į Netlify iš GitHub

Šis vadovas paaiškina, kaip sukonfigūruoti automatinį deploy į Netlify iš GitHub repozitorijos.

## Reikalavimai

- GitHub repozitorija su jūsų projekto kodu
- Netlify paskyra (galite sukurti nemokamai)
- Projektas turi būti paruoštas build (pvz., `npm run build`)

## Žingsniai

### 1. Paruoškite projektą

Įsitikinkite, kad jūsų `package.json` turi build scriptą:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### 2. Sukurkite Netlify paskyrą

1. Eikite į [Netlify](https://www.netlify.com/)
2. Spustelėkite "Sign up"
3. Pasirinkite "Sign up with GitHub"
4. Autorizuokite Netlify prieigą prie GitHub

### 3. Pridėkite naują svetainę iš GitHub

1. Netlify dashboard'e spustelėkite "Add new site"
2. Pasirinkite "Import an existing project"
3. Pasirinkite "Deploy with GitHub"
4. Autorizuokite Netlify prieigą prie GitHub (jei dar nepadarėte)
5. Pasirinkite repozitoriją, kurią norite deploy'inti
6. Pasirinkite branch (dažniausiai `main` arba `master`)

### 4. Konfigūruokite Build nustatymus

Netlify automatiškai aptiks jūsų projektą, bet gali reikėti nurodyti:

**Build command:**
```
npm run build
```

**Publish directory:**
```
dist
```

**Node version (jei reikia):**
```
18
```

### 5. Sukurkite `netlify.toml` failą (rekomenduojama)

Sukurkite `netlify.toml` failą projekto šaknyje:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Šis failas užtikrina, kad:
- Build komanda būtų teisinga
- Publish direktorija būtų teisinga
- Visi route'ai būtų nukreipti į `index.html` (svarbu SPA aplikacijoms)

### 6. Įtraukite `netlify.toml` į Git

```bash
git add netlify.toml
git commit -m "Add Netlify configuration"
git push
```

### 7. Patikrinkite Deploy

1. Netlify automatiškai pradės deploy po `git push`
2. Eikite į Netlify dashboard
3. Matysite deploy proceso būseną
4. Po sėkmingo deploy gausite URL (pvz., `your-app-name.netlify.app`)

## Automatinis Deploy

Po konfigūracijos:

- **Kiekvienas `git push` į pagrindinį branch** automatiškai sukels naują deploy
- **Pull Request'ai** gali turėti preview deploy (galite įjungti nustatymuose)
- **Deploy istorija** matoma Netlify dashboard'e

## Tinkinimas

### Kustomizuoti Domain

1. Netlify dashboard'e eikite į "Domain settings"
2. Spustelėkite "Add custom domain"
3. Įveskite savo domeną ir sekite instrukcijas

### Environment Variables

Jei reikia environment variables:

1. Netlify dashboard'e eikite į "Site settings"
2. Spustelėkite "Environment variables"
3. Pridėkite reikalingus kintamuosius (pvz., `VITE_API_KEY`)

### Build Hooks

Jei norite trigger'inti deploy be `git push`:

1. Netlify dashboard'e eikite į "Site settings"
2. Spustelėkite "Build & deploy"
3. Spustelėkite "Build hooks"
4. Sukurkite naują build hook ir naudokite URL POST request'ams

## Troubleshooting

### Build klaidos

- Patikrinkite, ar `package.json` turi teisingą build scriptą
- Patikrinkite, ar visos dependencies yra įtrauktos
- Peržiūrėkite build log'us Netlify dashboard'e

### 404 klaidos SPA aplikacijose

Įsitikinkite, kad `netlify.toml` turi redirect taisyklę:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables neveikia

- Įsitikinkite, kad kintamieji prasideda su `VITE_` (Vite projektams)
- Po kintamųjų pridėjimo, reikia naujo deploy

## Naudingos Nuorodos

- [Netlify Dokumentacija](https://docs.netlify.com/)
- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/overview/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
