import React, { useEffect, useState } from "react";

import { FormularioUsuario } from "./components/FormularioUsuario";
import TablaUsuarios from "./components/UsuarioTable";

import { useUsuarios } from "./hooks/useUsuario";
import { apiGet, buildModulePath } from "../../services/apiClient";
import { Institucion } from "../../types/entities/institucion";

export default function ActoresDashboard() {
    const [showForm, setShowForm] = useState(false);

    const {
        autoridades,
        secretarias,
        deces,
        administradores,
        loading,
        refrescarTablas
    } = useUsuarios();

    const usuarios = [
        ...autoridades,
        ...secretarias,
        ...deces,
        ...administradores
    ];

    // --- CATÁLOGO REAL DE INSTITUCIONES (desde su propio endpoint) ---
    const [instituciones, setInstituciones] = useState<Institucion[]>([]);
    const [cargandoInstituciones, setCargandoInstituciones] = useState(true);

    useEffect(() => {
        const cargarInstituciones = async () => {
            try {
                const data = await apiGet<Institucion[]>(
                    buildModulePath("institucion", "instituciones")
                );
                setInstituciones(data);
            } catch (error) {
                console.error("Error al cargar el catálogo de instituciones:", error);
            } finally {
                setCargandoInstituciones(false);
            }
        };
        cargarInstituciones();
    }, []);

    return (
        <div
            className="dashboard-content"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}
        >
            {/* CABECERA */}
            <div
                style={{
                    background: "var(--surface-container-lowest)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "8px",
                    padding: "20px"
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: "var(--primary)",
                        fontSize: "var(--font-headline-md)"
                    }}
                >
                    Gestión de Usuarios y Cuentas
                </h2>
                <p
                    style={{
                        marginTop: "8px",
                        color: "var(--on-surface-variant)"
                    }}
                >
                    Administración de usuarios, perfiles institucionales y control de acceso del sistema.
                </p>
            </div>

            {/* RESUMEN DE CONTADORES */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "16px"
                }}
            >
                <div
                    style={{
                        background: "var(--surface-container-lowest)",
                        border: "1px solid var(--outline-variant)",
                        borderRadius: "8px",
                        padding: "16px"
                    }}
                >
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary)" }}>
                        {autoridades.length}
                    </div>
                    <div>Autoridades</div>
                </div>

                <div
                    style={{
                        background: "var(--surface-container-lowest)",
                        border: "1px solid var(--outline-variant)",
                        borderRadius: "8px",
                        padding: "16px"
                    }}
                >
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary)" }}>
                        {secretarias.length}
                    </div>
                    <div>Secretarias</div>
                </div>

                <div
                    style={{
                        background: "var(--surface-container-lowest)",
                        border: "1px solid var(--outline-variant)",
                        borderRadius: "8px",
                        padding: "16px"
                    }}
                >
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary)" }}>
                        {deces.length}
                    </div>
                    <div>DECE</div>
                </div>

                <div
                    style={{
                        background: "var(--surface-container-lowest)",
                        border: "1px solid var(--outline-variant)",
                        borderRadius: "8px",
                        padding: "16px"
                    }}
                >
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary)" }}>
                        {administradores.length}
                    </div>
                    <div>Administradores</div>
                </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        background: "var(--secondary)",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer"
                    }}
                >
                    + Nuevo Usuario
                </button>
            </div>

            {/* SECCIÓN DE LA TABLA */}
            {loading ? (
                <div
                    style={{
                        background: "var(--surface-container-lowest)",
                        border: "1px solid var(--outline-variant)",
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center"
                    }}
                >
                    Cargando usuarios...
                </div>
            ) : (
                <TablaUsuarios usuarios={usuarios} />
            )}

            {/* MODAL DEL FORMULARIO */}
            {showForm && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}
                >
                    <div
                        style={{
                            width: "90%",
                            maxWidth: "1200px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "white",
                            borderRadius: "10px"
                        }}
                    >
                        {cargandoInstituciones ? (
                            <div style={{ padding: "40px", textAlign: "center" }}>
                                Cargando catálogo de instituciones...
                            </div>
                        ) : (
                            <FormularioUsuario
                                instituciones={instituciones}
                                onCancel={() => setShowForm(false)}
                                onSaveSuccess={() => {
                                    setShowForm(false);
                                    refrescarTablas();
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
