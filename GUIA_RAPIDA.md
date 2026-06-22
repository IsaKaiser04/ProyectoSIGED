# ⚡ Guía Rápida - Sistema de Pantalla y Errores

## 📥 Importar

```tsx
// Detectar pantalla
import { useScreenType } from '@/hooks/useScreenType';

// Manejar errores
import { safeAsync, processError } from '@/utils/errorHandler';

// Componentes
import { 
  ErrorAlert, 
  LoadingSpinner, 
  EmptyState, 
  StatusMessage 
} from '@/components/common/AlertComponents';
```

## 🎯 Uso Rápido

### Detectar Pantalla
```tsx
const { isMobile, isSmallScreen } = useScreenType();

<div className={isSmallScreen ? 'mobile-layout' : 'desktop-layout'}>
```

### Manejar Errores
```tsx
const result = await safeAsync(
  () => fetchData(),
  "Mensaje de fallback"
);

if (!result.success) setError(result.error.message);
```

### Mostrar Alerta
```tsx
<ErrorAlert error={error} onDismiss={() => setError(null)} />
```

### Proteger Contenido
```tsx
<div className="error-container">
  {/* Contenido dinámico - protegido de overflow */}
</div>
```

## 📱 Pantallas

| Nombre | Ancho | Hook |
|--------|-------|------|
| Mobile | <480px | `isMobile` |
| Tablet | 480-768px | `isTablet` |
| Desktop | 768-1440px | `isDesktop` |
| Wide | 1440px+ | `isWide` |

## 🛡️ Errores

| Tipo | Causa | Mensaje |
|------|-------|---------|
| network | Fetch falla | "No se pudo conectar..." |
| validation | Datos inválidos | Mensaje específico |
| server | 500, 503, etc | "El servidor está experimentando..." |
| unknown | Otros | "Ocurrió un error inesperado..." |

## 📦 Componentes

| Componente | Uso | Props |
|-----------|-----|-------|
| `ErrorAlert` | Mostrar errores | `error`, `onDismiss` |
| `LoadingSpinner` | Mostrar carga | `message`, `fullHeight` |
| `EmptyState` | Estado vacío | `message`, `action` |
| `StatusMessage` | Mensajes genéricos | `message`, `type` |

## 🎨 CSS

```css
/* Protege contenido dinámico */
.error-container {
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Layout móvil */
.feature-layout--stacked {
  grid-template-columns: 1fr;
}

/* Alerta mejorada */
.error-alert {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
```

## ✅ Checklist Mínimo

- [ ] Usa `useScreenType()` para layouts adaptativos
- [ ] Envuelve async con `safeAsync()`
- [ ] Muestra errores con `ErrorAlert`
- [ ] Agrega `error-container` a contenido dinámico

## 🔗 Documentación

- 📚 [Guía Completa](docs/SISTEMA_PANTALLA_ERRORES.md)
- 📊 [Arquitectura](ARQUITECTURA_PANTALLA_ERRORES.md)
- 💻 [Ejemplos](EJEMPLOS_USO.md)
- 📋 [Implementación](IMPLEMENTACION_PANTALLA_ERRORES.md)

---

**Eso es todo lo que necesitas saber para empezar.** 🚀
