"""Genera los archivos Excel y PDF del reporte de asistencia por asignatura (US-045).

Recibe el diccionario que devuelve AsistenciaService.reporte_asignatura;
no consulta la base de datos.
"""
import re
import unicodedata
from io import BytesIO
from xml.sax.saxutils import escape

from apps.asistencia.models import AsistenciaTipo

COLUMNAS_TIPO = [
    (AsistenciaTipo.ASISTENCIA, 'Asistió'),
    (AsistenciaTipo.INASISTENCIA, 'Faltó'),
    (AsistenciaTipo.JUSTIFICADO, 'Justificado'),
    (AsistenciaTipo.ATRASADO, 'Atrasado'),
]
ENCABEZADOS = (
    ['#', 'Estudiante', 'Identificación']
    + [etiqueta for _, etiqueta in COLUMNAS_TIPO]
    + ['Sin registro', '% Asistencia']
)
COLOR_ENCABEZADO = '1F3A5F'


def nombre_archivo(reporte, extension):
    """Nombre sin tildes ni espacios, seguro para la cabecera Content-Disposition."""
    base = f"asistencia_{reporte['asignatura']}_{reporte['paralelo']}_{reporte['periodo']['nombre']}"
    base = unicodedata.normalize('NFKD', base).encode('ascii', 'ignore').decode()
    base = re.sub(r'[^A-Za-z0-9]+', '_', base).strip('_')
    return f'{base}.{extension}'


def _datos_cabecera(reporte):
    p = reporte['periodo']
    return [
        ('Asignatura', reporte['asignatura']),
        ('Grado / Paralelo', f"{reporte['grado']} - {reporte['paralelo']}"),
        ('Año lectivo', reporte['anio_lectivo']),
        ('Docente', reporte['docente']),
        ('Período', f"{p['nombre']} ({p['fecha_inicio']} al {p['fecha_fin']})"),
        ('Clases registradas', reporte['clases_dictadas']),
    ]


def _fila(numero, e):
    porcentaje = e['porcentaje_asistencia']
    return (
        [numero, e['estudiante_nombre'], e['identificacion']]
        + [e['resumen'][tipo] for tipo, _ in COLUMNAS_TIPO]
        + [e['sin_registro'], porcentaje if porcentaje is not None else '—']
    )


def generar_excel(reporte):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    wb = Workbook()
    ws = wb.active
    ws.title = 'Asistencia'

    ws.append(['Reporte de asistencia por asignatura'])
    ws['A1'].font = Font(bold=True, size=14)
    for etiqueta, valor in _datos_cabecera(reporte):
        ws.append([etiqueta, valor])
        ws.cell(row=ws.max_row, column=1).font = Font(bold=True)
    ws.append([])

    ws.append(ENCABEZADOS)
    fila_encabezado = ws.max_row
    for col in range(1, len(ENCABEZADOS) + 1):
        celda = ws.cell(row=fila_encabezado, column=col)
        celda.font = Font(bold=True, color='FFFFFF')
        celda.fill = PatternFill('solid', fgColor=COLOR_ENCABEZADO)
        celda.alignment = Alignment(horizontal='center')

    for numero, e in enumerate(reporte['estudiantes'], start=1):
        ws.append(_fila(numero, e))
    if not reporte['estudiantes']:
        ws.append(['', 'No hay estudiantes con matrícula legalizada en este paralelo.'])

    for i, ancho in enumerate([5, 35, 16, 10, 10, 12, 10, 13, 13], start=1):
        ws.column_dimensions[get_column_letter(i)].width = ancho

    salida = BytesIO()
    wb.save(salida)
    return salida.getvalue()


def generar_pdf(reporte):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    salida = BytesIO()
    doc = SimpleDocTemplate(
        salida, pagesize=landscape(A4), title='Reporte de asistencia',
        leftMargin=1.5 * cm, rightMargin=1.5 * cm, topMargin=1.5 * cm, bottomMargin=1.5 * cm,
    )
    estilos = getSampleStyleSheet()

    elementos = [Paragraph('Reporte de asistencia por asignatura', estilos['Title'])]
    for etiqueta, valor in _datos_cabecera(reporte):
        elementos.append(Paragraph(f'<b>{etiqueta}:</b> {escape(str(valor))}', estilos['Normal']))
    elementos.append(Spacer(1, 0.4 * cm))

    datos = [ENCABEZADOS] + [
        [str(v) for v in _fila(numero, e)] for numero, e in enumerate(reporte['estudiantes'], start=1)
    ]
    if not reporte['estudiantes']:
        datos.append(['', 'No hay estudiantes con matrícula legalizada en este paralelo.'] + [''] * (len(ENCABEZADOS) - 2))

    tabla = Table(
        datos, repeatRows=1,
        colWidths=[1 * cm, 7.5 * cm, 3.2 * cm] + [2.2 * cm] * 4 + [2.4 * cm, 2.6 * cm],
    )
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(f'#{COLOR_ENCABEZADO}')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')]),
    ]))
    elementos.append(tabla)

    doc.build(elementos)
    return salida.getvalue()
