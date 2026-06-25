import { useEffect, useState, useCallback } from "react";

export type ScreenType = "mobile" | "tablet" | "desktop" | "wide";

interface ScreenBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

const DEFAULT_BREAKPOINTS: ScreenBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};

/**
 * Hook que detecta el tipo de pantalla actual basado en el ancho de la ventana
 * y proporciona información útil para adaptación responsiva
 *
 * @param breakpoints - Puntos de corte personalizados (opcional)
 * @returns Objeto con información del tipo de pantalla y funciones auxiliares
 */
export function useScreenType(breakpoints: Partial<ScreenBreakpoints> = {}) {
  const finalBreakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  const [screenType, setScreenType] = useState<ScreenType>("desktop");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  /**
   * Determina el tipo de pantalla según el ancho
   */
  const getScreenType = useCallback((width: number): ScreenType => {
    if (width < finalBreakpoints.mobile) return "mobile";
    if (width < finalBreakpoints.tablet) return "mobile";
    if (width < finalBreakpoints.desktop) return "tablet";
    if (width < finalBreakpoints.wide) return "desktop";
    return "wide";
  }, [finalBreakpoints]);

  /**
   * Maneja el redimensionamiento de la ventana con debounce
   */
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;


    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newWidth = window.innerWidth;
        setWindowWidth(newWidth);
        setScreenType(getScreenType(newWidth));
      }, 150); // Debounce de 150ms
    };

    // Establecer el tipo inicial
    setScreenType(getScreenType(window.innerWidth));

    // Agregar listener
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [getScreenType]);

  return {
    screenType,
    windowWidth,
    isMobile: screenType === "mobile",
    isTablet: screenType === "tablet",
    isDesktop: screenType === "desktop",
    isWide: screenType === "wide",
    isSmallScreen: screenType === "mobile" || screenType === "tablet",
    isLargeScreen: screenType === "desktop" || screenType === "wide"
  };
}

/**
 * Hook para obtener clases CSS dinámicas según el tipo de pantalla
 */
export function useResponsiveClasses(baseClass: string = "") {
  const { isMobile, isTablet, isDesktop, isWide } = useScreenType();

  const getClasses = useCallback(
    (classMap: {
      mobile?: string;
      tablet?: string;
      desktop?: string;
      wide?: string;
    }) => {
      const classes = [baseClass];

      if (isMobile && classMap.mobile) classes.push(classMap.mobile);
      if (isTablet && classMap.tablet) classes.push(classMap.tablet);
      if (isDesktop && classMap.desktop) classes.push(classMap.desktop);
      if (isWide && classMap.wide) classes.push(classMap.wide);

      return classes.join(" ");
    },
    [baseClass, isMobile, isTablet, isDesktop, isWide]
  );

  return getClasses;
}
