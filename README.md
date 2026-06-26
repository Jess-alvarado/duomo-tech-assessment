# Prueba Técnica - Gestión de Personas

Aplicación full-stack para administrar personas (crear, listar, eliminar), con selección dependiente de Región y Comuna.

- **Backend:** Spring Boot 3.5 (Java 17) — API REST, datos en memoria
- **Frontend:** Angular 22 (Standalone Components + Signals)

## Requisitos

- Java 17
- Maven (se incluye el wrapper `mvnw`, no es necesario tenerlo instalado globalmente)
- Node.js 24.x
- npm (incluido con Node)

## Ejecución

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor queda disponible en `http://localhost:8090`.

> En Windows, usa `mvnw.cmd spring-boot:run` en lugar de `./mvnw spring-boot:run`.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
ng serve
```

La aplicación queda disponible en `http://localhost:4200`.

## Ejecución de pruebas

### Backend

```bash
cd backend
./mvnw test
```

Cubre `PersonService`, `CatalogService` y `PersonController` (validaciones, casos de éxito, errores y casos borde como id no numérico).

### Frontend

```bash
cd frontend
npm test
```

Cubre los servicios HTTP (`PersonService`, `CatalogService`), el estado centralizado (`PersonStateService`) y el formulario (`PersonForm`), incluyendo validaciones y la regla de negocio de comuna/región.

## Decisiones técnicas

Las siguientes decisiones se tomaron buscando mantener una solución simple, fácil de mantener y alineada con el alcance de la prueba.

- **Catálogo de Región/Comuna en memoria, con datos de ejemplo acotados** (3 regiones, algunas comunas por región). El enunciado no exige persistencia ni el listado completo de Chile, así que se priorizó mantener el alcance simple y enfocado en la lógica de la prueba.
- **Validación de comuna-región duplicada en frontend y backend.** El frontend valida para dar feedback inmediato al usuario; el backend valida porque nunca se debe confiar únicamente en el cliente.
- **Estado del frontend centralizado en `PersonStateService` con Angular Signals**, en lugar de mantener el estado duplicado entre componentes. Esto evita problemas de sincronización al crear o eliminar personas (la lista se actualiza automáticamente sin recargar todo desde el backend).
- **CSS plano, sin librería de componentes**, priorizando mantener la solución simple y evitando agregar dependencias que no aportaban valor al alcance de la prueba.

## Estructura del proyecto

```
backend/
└── src/main/java/com/duomo/personmanagement/
    ├── controller/      # Endpoints REST
    ├── service/         # Lógica de negocio
    ├── repository/       # Almacenamiento en memoria
    ├── model/            # Entidades de dominio
    ├── dto/              # Request/Response
    └── exception/        # Manejo global de excepciones

frontend/
└── src/app/
    ├── core/
    │   └── models/                  # Modelos transversales (AppError)
    │
    ├── features/
    │   └── persons/
    │       ├── components/
    │       │   ├── person-form/     # Formulario de creación de personas
    │       │   └── person-list/     # Listado y eliminación de personas
    │       │
    │       ├── model/               # Modelos de la funcionalidad (Person, Region, Commune)
    │       │
    │       └── services/            # Servicios HTTP y gestión de estado (Signals)
    │
    ├── validators/                  # Validadores personalizados (edad mínima)
    │
    ├── app.config.ts                # Configuración principal
    ├── app.routes.ts                # Rutas de la aplicación
    └── app.ts                       # Componente raíz
```
