# Penguin Random House - Angular Aplikacija

Angular aplikacija za iskanje knjig in avtorjev preko Penguin Random House API-ja.

## Demonstrirani Angular koncepti

Ta projekt demonstrira naslednje Angular mehanizme:

| Koncept | Opis | Datoteke |
| ------- | ---- | -------- |
| **Data Binding** | Interpolacija, property, event in two-way binding | `search-form.html`, `title-card.html` |
| **@Input / @Output** | Komunikacija med komponentami | `title-card.component.ts`, `search-form.component.ts` |
| **Strukturne direktive** | `@if`, `@for`, `@else` | `search-form.html`, `search.html` |
| **Atributne direktive** | `ngClass`, lastna `appHighlight` | `highlight.directive.ts` |
| **Template Driven Forms** | `ngModel`, validacija, `#form="ngForm"` | `search-form.html`, `login.html` |
| **Angular storitve** | `@Injectable`, `providedIn: 'root'` | `auth.service.ts`, `prh-api.service.ts` |
| **Observables** | `HttpClient`, `pipe()`, `map()`, `subscribe()` | `prh-api.service.ts` |
| **Routing** | Lazy loading, route guards, parametri | `app.routes.ts` |
| **JWT & Interceptors** | Auth guard, HTTP interceptors | `auth.guard.ts`, `auth.interceptor.ts` |

## Tehnologije

- **Angular 21** - Standalone komponente
- **Bootstrap 5** - UI framework
- **RxJS** - Reaktivno programiranje
- **TypeScript** - Tipizacija

## Zagon aplikacije

### Predpogoji

- Node.js 18+
- npm ali yarn

### Namestitev

```bash
cd angular-project
npm install
```

### Razvojni strežnik

```bash
npm start
# ali
ng serve
```

Odpri <http://localhost:4200> v brskalniku.

### Prijava

Uporabi poljubno uporabniško ime in geslo (min. 4 znaki).

## Struktura projekta

```text
src/app/
├── components/           # Ponovno uporabne komponente
│   ├── author-card/      # Kartica avtorja
│   ├── loader/           # Loading spinner
│   ├── navbar/           # Navigacija
│   ├── pagination/       # Paginacija
│   ├── search-form/      # Obrazec za iskanje (TDF)
│   └── title-card/       # Kartica knjige
├── directives/           # Lastne direktive
│   └── highlight.directive.ts
├── guards/               # Route guards
│   └── auth.guard.ts
├── interceptors/         # HTTP interceptors
│   ├── auth.interceptor.ts
│   └── error.interceptor.ts
├── models/               # TypeScript modeli
├── pages/                # Strani (lazy loaded)
│   ├── author-detail/
│   ├── login/
│   ├── not-found/
│   ├── search/
│   └── title-detail/
├── services/             # Angular storitve
│   ├── auth.service.ts
│   └── prh-api.service.ts
├── app.config.ts         # Konfiguracija aplikacije
└── app.routes.ts         # Definicija poti
```

## Ključne datoteke s komentarji

Vse ključne datoteke vsebujejo podrobne komentarje, ki razlagajo Angular koncepte:

- `search-form.component.ts` - @Input/@Output, FormsModule
- `search-form.html` - Data binding, TDF, direktive
- `auth.service.ts` - Storitve, Signals, JWT
- `prh-api.service.ts` - HttpClient, Observables, RxJS
- `app.routes.ts` - Routing, Lazy loading
- `auth.guard.ts` - Route guards
- `auth.interceptor.ts` - HTTP interceptors
- `highlight.directive.ts` - Custom direktive

## API

Aplikacija uporablja [Penguin Random House API v2](https://developer.penguinrandomhouse.com/).

## Avtor

Projektna naloga za predmet spletne tehnologije.
