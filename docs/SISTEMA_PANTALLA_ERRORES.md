# Sistema de Detección de Pantalla, Manejo de Errores y CSS Defensivo

Este documento describe las mejoras implementadas para hacer tu interfaz robusta, responsiva y tolerante a errores.

## 🎯 Características Implementadas

### 1. Hook de Detección de Pantalla (`useScreenType`)

**Ubicación:** `src/hooks/useScreenType.ts`

Este hook detecta automáticamente el tipo de pantalla y proporciona información útil para adaptación responsiva.

#### Uso Básico

```tsx
import { useScreenType } from '@/hooks/useScreenType';

export function MiComponente() {
  const { screenType, isMobile, isTablet, isDesktop, isWide } = useScreenType();

  return (
    <div>
      {isMobile && <p>Estás en móvil</p>}
      {isTablet && <p>Estás en tablet</p>}
      {isDesktop && <p>Estás en desktop</p>}
      <p>Tipo: {screenType}</p>
    </div>
  );
}
```

#### Propiedades Disponibles

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `screenType` | `"mobile" \| "tablet" \| "desktop" \| "wide"` | Tipo de pantalla actual |
| `windowWidth` | `number` | Ancho actual de la ventana en píxeles |
| `isMobile` | `boolean` | ¿Es pantalla móvil? |
| `isTablet` | `boolean` | ¿Es pantalla tablet? |
| `isDesktop` | `boolean` | ¿Es pantalla desktop? |
| `isWide` | `boolean` | ¿Es pantalla muy ancha? |
| `isSmallScreen` | `boolean` | ¿Es móvil o tablet? |
| `isLargeScreen` | `boolean` | ¿Es desktop o wide? |

#### Puntos de Corte Personalizados

```tsx
const { isMobile } = useScreenType({
  mobile: 400,
  tablet: 700,
  desktop: 1000,
  wide: 1500
});
```

### 2. Utilidades de Manejo de Errores (`errorHandler.ts`)

**Ubicación:** `src/utils/errorHandler.ts`

Proporciona funciones centralizadas para manejar errores de red, validación y servidor de forma amigable.

#### Función `processError()`

Convierte cualquier error en un objeto `ErrorInfo` con mensaje amigable y tipo clasificado.

```tsx
import { processError } from '@/utils/errorHandler';

try {
  await fetchData();
} catch (error) {
  const { message, type } = processError(error);
  // message: "No se pudo conectar con el servidor..."
  // type: "network" | "validation" | "server" | "unknown"
}
```

#### Función `safeAsync()`

Envuelve operaciones async con manejo de errores automático.

```tsx
import { safeAsync } from '@/utils/errorHandler';

const result = await safeAsync(
  () => fetchCategorias(),
  "No se pudieron cargar las categorías"
);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

#### Función `safeFetch()`

Realiza fetches seguros con validación de respuesta.

```tsx
import { safeFetch } from '@/utils/errorHandler';

try {
  const data = await safeFetch<Categories>(
    '/api/categorias',
    { method: 'GET' },
    abortSignal
  );
} catch (error) {
  // Error ya procesado y amigable
}
```

### 3. Componentes de Alerta Reutilizables

**Ubicación:** `src/components/common/AlertComponents.tsx`

Componentes listos para usar con estilos defensivos integrados.

#### `ErrorAlert`

```tsx
import { ErrorAlert } from '@/components/common/AlertComponents';

<ErrorAlert 
  error="No se pudo guardar"
  onDismiss={() => setError(null)}
  dismissible={true}
/>
```

#### `LoadingSpinner`

```tsx
import { LoadingSpinner } from '@/components/common/AlertComponents';

<LoadingSpinner message="Cargando categorías..." />
```

#### `EmptyState`

```tsx
import { EmptyState } from '@/components/common/AlertComponents';

<EmptyState 
  message="No hay categorías. Crea la primera."
  action={{
    label: "Crear categoría",
    onClick: () => handleCreate()
  }}
/>
```

#### `StatusMessage`

```tsx
import { StatusMessage } from '@/components/common/AlertComponents';

<StatusMessage 
  message="Categoría guardada exitosamente"
  type="success"
  onDismiss={() => setMessage(null)}
/>
```

### 4. CSS Defensivo

**Ubicación:** `src/styles/calificaciones.css`

Se agregaron estilos defensivos para garantizar que:
- Textos largos se envuelvan correctamente
- Los contenedores no se deformen
- El diseño se adapte a cualquier pantalla
- Los errores dinámicos se muestren correctamente

#### Clases Principales

| Clase | Propósito |
|-------|----------|
| `.error-container` | Contenedor defensivo para cualquier contenido dinámico |
| `.error-alert` | Alerta de error mejorada |
| `.feature-page--mobile` | Estilos específicos para móviles |
| `.feature-layout--stacked` | Layout apilado en pantallas pequeñas |

#### Propiedades Defensivas Aplicadas

```css
.error-container {
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  min-width: 0;
  max-width: 100%;
}
```

Esto evita que:
- URLs largas deformen el layout
- Mensajes de error rompan el diseño
- Números sin espacios causen overflow
- Contenido dinámico se desplace

## 📋 Ejemplo Completo: Integración en un Componente

```tsx
import { useState, useEffect } from 'react';
import { useScreenType } from '@/hooks/useScreenType';
import { ErrorAlert, LoadingSpinner, EmptyState } from '@/components/common/AlertComponents';
import { safeAsync, processError } from '@/utils/errorHandler';

export function MiPagina() {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isSmallScreen } = useScreenType();

  // Cargar datos con manejo de errores automático
  const cargarDatos = async () => {
    setIsLoading(true);
    setError(null);

    const result = await safeAsync(
      () => fetchDatos(),
      "No se pudieron cargar los datos"
    );

    if (result.success) {
      setDatos(result.data);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <section className={`mi-seccion ${isSmallScreen ? 'mi-seccion--mobile' : ''}`}>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {datos.length === 0 ? (
        <EmptyState 
          message="No hay datos"
          action={{ label: "Crear", onClick: cargarDatos }}
        />
      ) : (
        <ul>
          {datos.map(item => (
            <li key={item.id} className="error-container">
              {item.nombre}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

## 🔒 Beneficios de la Implementación

✅ **Errores Amigables**: Los usuarios ven mensajes claros en lugar de objetos de error crudo
✅ **Responsivo Automático**: Detecta pantallas sin código manual
✅ **CSS Defensivo**: Los textos largos nunca rompen el diseño
✅ **Accesible**: Incluye `role` y `aria-*` atributos
✅ **Reutilizable**: Componentes listos para copiar/pegar
✅ **Type-Safe**: Totalmente tipado con TypeScript
✅ **Conexión Robusta**: Maneja fallos de red gracefully

## 📱 Puntos de Corte Responsivos

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: 768px - 1024px
- **Wide**: 1440px+

## 🚀 Próximos Pasos (Opcional)

1. **Integrar en otros componentes**: Usa `useScreenType` y `ErrorAlert` en todas tus páginas
2. **Toast Notifications**: Crea un sistema de notificaciones para operaciones exitosas
3. **Retry Logic**: Agrega reintentos automáticos en fallos de red
4. **Offline Support**: Detecta desconexión y muestra modo offline

