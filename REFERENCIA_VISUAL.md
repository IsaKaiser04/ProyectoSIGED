# 🎨 Referencia Visual - Componentes y Flujos

## Flujo General de la Aplicación

```
┌──────────────────────────────────────────────────────────────┐
│                    USUARIO EN LA WEB                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  NAVEGADOR    │
                    │ (ancho 375px) │
                    └───────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
  useScreenType()                         Interacción
  ├─ windowWidth: 375                     ├─ Click Actualizar
  ├─ screenType: "mobile"                 ├─ Click Guardar
  ├─ isMobile: true                       └─ Click Eliminar
  └─ isSmallScreen: true                           ↓
        ↓                                    loadCategorias()
  Classes aplicadas:                       deleteCategoria()
  ├─ feature-page--mobile                 updateCategoria()
  ├─ feature-layout--stacked              createCategoria()
  └─ UI se apila verticalmente                    ↓
                                         ┌─────────────────────┐
                                         │   API Request       │
                                         │ /api/categorias     │
                                         └─────────────────────┘
                                                  ↓
                                    ┌──────────────────────────┐
                                    │ Respuesta exitosa        │
                                    │ o Error                  │
                                    └──────────────────────────┘
                                                  ↓
                                    ┌──────────────────────────┐
                                    │  safeAsync() procesa     │
                                    │  • Valida respuesta      │
                                    │  • Captura errores       │
                                    │  • Retorna resultado     │
                                    └──────────────────────────┘
                                                  ↓
                                    ┌──────────────────────────┐
                                    │  processError()          │
                                    │  clasifica el error      │
                                    └──────────────────────────┘
                                                  ↓
                                    ┌──────────────────────────┐
                                    │  Renderizar componente   │
                                    │  • ErrorAlert            │
                                    │  • LoadingSpinner        │
                                    │  • EmptyState            │
                                    │  • Datos                 │
                                    └──────────────────────────┘
                                                  ↓
                                    ┌──────────────────────────┐
                                    │  CSS defensivo           │
                                    │  • .error-container      │
                                    │  • word-break            │
                                    │  • overflow-wrap         │
                                    └──────────────────────────┘
                                                  ↓
                                        ┌──────────────┐
                                        │ PANTALLA     │
                                        │ RENDERIZADA  │
                                        └──────────────┘
```

## Estados de Carga

```
┌────────────────────────────────────────────────────────┐
│            CICLO DE VIDA DE UNA OPERACIÓN             │
└────────────────────────────────────────────────────────┘

1️⃣ ESTADO: IDLE
   ├─ isLoading: false
   ├─ error: null
   ├─ Renderiza: Tabla con datos
   └─ Botón: "Actualizar" activado

2️⃣ ESTADO: LOADING
   ├─ isLoading: true
   ├─ error: null
   ├─ Renderiza: <LoadingSpinner message="Cargando..." />
   └─ Botón: "Actualizar" desactivado

3️⃣ ESTADO: SUCCESS
   ├─ isLoading: false
   ├─ error: null
   ├─ setCategorias(data)
   └─ Renderiza: Tabla actualizada
                                    ↙ A 1️⃣ IDLE

3️⃣ ESTADO: ERROR
   ├─ isLoading: false
   ├─ error: ErrorInfo
   ├─ Renderiza: <ErrorAlert error={error} />
   ├─ Botón: "Descartar" para cerrar alerta
   └─ Botón: "Actualizar" para reintentar
                                    ↙ A 1️⃣ IDLE
```

## Tipos de Pantalla Detectados

```
┌─────────────────────────────────────────────────────────────────┐
│                    BREAKPOINTS RESPONSIVOS                      │
└─────────────────────────────────────────────────────────────────┘

0px    480px         768px              1024px            1440px
├──────┼──────────────┼────────────────────┼────────────────────┤
│      │              │                    │                    │
│ MOBILE (isMobile)  TABLET            DESKTOP              WIDE
│ • <480px          (isTablet)          (isDesktop)         (isWide)
│ • 1 columna       • Formulario        • 2 columnas        • Ultra ancho
│ • Botones 44px      + Tabla          • Tabla normal       • 4+ columnas
│ • Sin scroll        lado lado        • Botones normales   • Máximo 1400px
│   horizontal                                              

Características por tamaño:
┌─────────────────┬─────────────┬──────────────┬───────────────┐
│ Móvil           │ Tablet      │ Desktop      │ Wide          │
├─────────────────┼─────────────┼──────────────┼───────────────┤
│ • Touch-first   │ • Flexible  │ • 2 paneles  │ • Multi-pane  │
│ • Botones 44px  │ • Side menu │ • Datos      │ • Gráficos    │
│ • Stack layout  │ • Swipe     │   grandes    │ • Analytics   │
│ • Grande texto  │ • Rotación  │ • Múltiples  │ • Reportes    │
│ • Pocos campos  │ • Swiping   │   tablas     │   complejos    │
└─────────────────┴─────────────┴──────────────┴───────────────┘
```

## Tipos de Errores y Mensajes

```
┌────────────────────────────────────────────────────────────────┐
│                   CLASIFICACIÓN DE ERRORES                     │
└────────────────────────────────────────────────────────────────┘

Error de RED:
├─ Causa: fetch() falla, sin conexión
├─ Clasificación: "network"
├─ Color: Rojo (#ffdad6)
└─ Mensaje: "No se pudo conectar con el servidor.
             Verifica tu conexión a internet e intenta de nuevo."

Error de VALIDACIÓN:
├─ Causa: Datos no válidos en el servidor
├─ Clasificación: "validation"
├─ Color: Naranja (#ffd699)
└─ Mensaje: El específico del servidor
             "El email debe ser válido"

Error del SERVIDOR:
├─ Causa: Status 500, 503, 502, etc
├─ Clasificación: "server"
├─ Color: Rojo (#ffdad6)
└─ Mensaje: "El servidor está experimentando problemas.
             Por favor, intenta más tarde."

Error DESCONOCIDO:
├─ Causa: Cualquier otro error
├─ Clasificación: "unknown"
├─ Color: Gris (#e0e0e0)
└─ Mensaje: "Ocurrió un error inesperado.
             Por favor, intenta de nuevo."
```

## Componente: ErrorAlert

```
┌────────────────────────────────────────────┐
│        <ErrorAlert error={error} />        │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ⚠️  No se pudo conectar con el      │ │
│  │ servidor. Verifica tu conexión...   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────┐  ┌──────────────────────┐  │
│  │ Descartar│  │  Reintentar [fetch]  │  │
│  └──────────┘  └──────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘

Props:
├─ error: string | ErrorInfo | null
├─ onDismiss?: () => void
├─ variant?: "error" | "warning" | "info"
└─ dismissible?: boolean

Estilos:
├─ Rojo para errors
├─ Naranja para warnings
├─ Azul para info
└─ Responsive en móvil
```

## Componente: LoadingSpinner

```
┌────────────────────────────────────────────┐
│   <LoadingSpinner message="Cargando..." /> │
├────────────────────────────────────────────┤
│                                            │
│              ⟳⟳⟳⟳⟳⟳                       │
│          (animación rotativa)              │
│                                            │
│         Cargando categorías...             │
│                                            │
└────────────────────────────────────────────┘

Props:
├─ message?: string
└─ fullHeight?: boolean

Animación:
└─ Rotación infinita 0.8s
```

## Componente: EmptyState

```
┌────────────────────────────────────────────┐
│  <EmptyState message="Sin datos" />        │
├────────────────────────────────────────────┤
│                                            │
│              📭 Sin datos                 │
│                                            │
│         Todavía no hay categorías.         │
│      Crea la primera para empezar.         │
│                                            │
│    ┌─────────────────────────────────┐   │
│    │  Crear categoría      →         │   │
│    └─────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘

Props:
├─ message: string
└─ action?: { label: string; onClick: () => void }
```

## Componente: StatusMessage

```
┌────────────────────────────────────────────┐
│  <StatusMessage type="success" />          │
├────────────────────────────────────────────┤
│                                            │
│  ✓ Categoría creada exitosamente      ✕  │
│                                            │
└────────────────────────────────────────────┘

Variantes:
├─ success: Verde (#81c995)
├─ error: Rojo (#ffdad6)
├─ warning: Naranja (#ffd699)
└─ info: Azul (#99d4ff)

Props:
├─ message: string
├─ type?: "success" | "error" | "warning" | "info"
└─ onDismiss?: () => void
```

## Flujo de Error: Caso Real

```
Usuario hace click en "Actualizar"
        ↓
loadCategorias() se llama
        ↓
setIsLoading(true)
        ↓
        ┌─────────────────────────────┐
        │ <LoadingSpinner />          │
        │ "Cargando categorías..."    │
        │ (spinner rotante)           │
        └─────────────────────────────┘
        ↓
fetch('/api/categorias') → 0ms (sin conexión)
        ↓
safeAsync() captura el error
        ↓
processError(error) devuelve:
{
  message: "No se pudo conectar...",
  type: "network"
}
        ↓
setIsLoading(false)
setLoadError(result.error.message)
        ↓
        ┌─────────────────────────────┐
        │ <ErrorAlert />              │
        │ "No se pudo conectar..."    │
        │ [Descartar] [Reintentar]    │
        └─────────────────────────────┘
        ↓
Usuario hace click "Reintentar"
        ↓
VUELVE AL INICIO
```

## Integración en una Página

```
┌───────────────────────────────────────────────────┐
│      EvaluacionCategoriaPage.tsx                  │
├───────────────────────────────────────────────────┤
│                                                   │
│  const { isSmallScreen } = useScreenType()       │
│  const [error, setError] = useState(null)        │
│                                                   │
│  <section className={`layout ${                  │
│    isSmallScreen ? 'stacked' : 'side-by-side'    │
│  }`}>                                             │
│                                                   │
│    <ErrorAlert error={error}                     │
│      onDismiss={() => setError(null)} />         │
│                                                   │
│    {isLoading ? <LoadingSpinner /> :             │
│     datos.length === 0 ? <EmptyState /> :        │
│     <Tabla datos={datos} />}                     │
│                                                   │
│  </section>                                       │
│                                                   │
└───────────────────────────────────────────────────┘
```

## CSS Defensivo en Acción

```
Contenedor SIN protección:          Contenedor CON protección:
┌─────────────┐                     ┌─────────────┐
│ Texto largo │                     │ Texto largo │
│ sin espaciossinspace que         │ sin espacios │
│ deforma     el ancho del box      │ sin space   │
│ rompe       el layout             │ que forma   │
└─────────────┘                     │ el layout   │
❌ Overflow                          │ correctamente
                                    └─────────────┘
                                    ✅ Envuelto

CSS:
.error-container {
  overflow-wrap: break-word;  ← Envuelve en palabras
  word-break: break-word;     ← Rompe palabras largas
  min-width: 0;               ← Permite flex shrink
  white-space: normal;        ← No pre-formatea
}
```

---

**Todos los diagramas son una representación visual de cómo el sistema funciona en tiempo real.**
