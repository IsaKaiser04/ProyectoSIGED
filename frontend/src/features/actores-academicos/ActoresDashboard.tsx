import React, { useEffect, useState } from "react";

import { FormularioUsuario } from "./components/FormularioUsuario";
import TablaUsuarios from "./components/UsuarioTable";
import { PanelFiltrosUsuarios } from "./components/PanelFiltrosUsuarios";

import { useUsuarios } from "./hooks/useUsuario";
import { toggleActivoCuenta } from "./services/usuariosApi";
import { apiGet, buildModulePath } from "../../services/apiClient";
import { showSuccess, showError, showWarning } from "../../components/Toast";
import { Institucion } from "../../types/entities/institucion";

type Usuario = any;

export default function ActoresDashboard() {
    const [showForm, setShowForm] = useState(false);
    const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

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

    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroIdentificacion, setFiltroIdentificacion] = useState("");
    const [filtroRol, setFiltroRol] = useState("");

    const usuariosFiltrados = usuarios.filter((u) => {
        const nombreMatch = filtroNombre === "" || `${u.nombres} ${u.apellidos}`.toLowerCase().includes(filtroNombre.toLowerCase());
        const idMatch = filtroIdentificacion === "" || (u.identificacion || "").includes(filtroIdentificacion);
        const rol = u.cuenta?.rol || "";
        const rolMatch = filtroRol === "" || rol === filtroRol;
        return nombreMatch && idMatch && rolMatch;
    });

    const totalPages = Math.ceil(usuariosFiltrados.length / rowsPerPage) || 1;
    const startIndex = (page - 1) * rowsPerPage;
    const usuariosPaginados = usuariosFiltrados.slice(startIndex, startIndex + rowsPerPage);

    useEffect(() => { setPage(1); }, [filtroNombre, filtroIdentificacion, filtroRol]);

    const limpiarFiltros = () => {
        setFiltroNombre("");
        setFiltroIdentificacion("");
        setFiltroRol("");
    };

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

    const handleToggleActive = async (usuario: Usuario) => {
        const esActivo = usuario.cuenta?.es_activo;
        const nuevoEstado = !esActivo;
        const accion = nuevoEstado ? "activar" : "desactivar";

        if (!window.confirm(`¿Está seguro de ${accion} este usuario?`)) return;

        try {
            const cuentaId = usuario.cuenta?.id;
            if (!cuentaId) {
                showError("Este usuario no tiene cuenta asociada.");
                return;
            }
            await toggleActivoCuenta(cuentaId, nuevoEstado);
            showSuccess(`Usuario ${nuevoEstado ? "activado" : "desactivado"} correctamente.`);
            refrescarTablas();
        } catch (error: any) {
            const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} el usuario.`;
            showWarning(msg);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setUsuarioEdit(null);
    };

    const handleSaveSuccess = () => {
        setShowForm(false);
        setUsuarioEdit(null);
        refrescarTablas();
    };

    return (
        <div
            className="dashboard-content"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}
        >
            <div
                style={{
                    background: "var(--surface-container-lowest)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "8px",
                    padding: "16px 20px"
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
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={() => { setUsuarioEdit(null); setShowForm(true); }}
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

            <PanelFiltrosUsuarios
                filtroNombre={filtroNombre}
                setFiltroNombre={setFiltroNombre}
                filtroIdentificacion={filtroIdentificacion}
                setFiltroIdentificacion={setFiltroIdentificacion}
                filtroRol={filtroRol}
                setFiltroRol={setFiltroRol}
                onLimpiar={limpiarFiltros}
            />

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
                <TablaUsuarios
                    usuarios={usuariosPaginados}
                    onToggleActive={handleToggleActive}
                    page={page}
                    totalPages={totalPages}
                    startIndex={startIndex}
                    onPageChange={setPage}
                />
            )}

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
                                usuarioEdit={usuarioEdit}
                                onCancel={handleCloseForm}
                                onSaveSuccess={handleSaveSuccess}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}