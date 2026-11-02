import os
import re
import json
from datetime import datetime
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask import (Flask, render_template, request,
                   redirect, url_for, flash, abort, make_response)
from sqlalchemy import text

from db import get_db
from models import Voluntario, Avistamiento, Registro, Ave, Region, Comuna, Comentario


load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
if not app.secret_key:
    raise RuntimeError("Falta SECRET_KEY en el archivo .env (ver .env.example)")

UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "mp4", "mov", "avi", "webm"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def a_entero(valor):
    """Convierte un texto a entero positivo. Retorna None si no es válido
    ("abc", "", "-3", "1.5"...)"""
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None
    if numero <= 0:
        return None
    return numero

def respuesta_json(datos, status=200):
    resp = make_response(json.dumps(datos), status)
    resp.headers["Content-type"] = "application/json;charset=UTF-8"
    resp.headers["Cache-Control"] = "no-cache"
    return resp

@app.route('/')
def index():
    db = get_db()
    try:
        ultimos = (db.query(Avistamiento)
        .order_by(Avistamiento.id.desc())
        .limit(2)
        .all())
        return render_template('index.html', avistamientos=ultimos)
    finally:
        db.close()


@app.route('/registro-voluntario', methods=["GET","POST"])
def registro_voluntario():
    db = get_db()
    try:
        regiones = db.query(Region).order_by(Region.nombre).all()
        comunas = db.query(Comuna).order_by(Comuna.nombre).all()

        if request.method == "GET":
            return render_template("registro-voluntario.html",
            regiones=regiones, comunas=comunas,
            errores={}, valores={})
        
        # metodo POST
        email      = request.form.get("email", "").strip()
        nombre     = request.form.get("nombre", "").strip()
        contrasenna = request.form.get("contrasenna", "").strip()
        telefono   = request.form.get("telefono", "").strip()
        comuna_id  = request.form.get("comunas", "").strip()

        valores = {
            "email":       email,
            "nombre":      nombre,
            "telefono":    telefono,
            "comuna_id":   comuna_id,
        }

        #validaciones
        errores = {}
        mail_regex = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'

        if not re.match(mail_regex, email) or len(email) > 80:
            errores["email"] = "Email inválido."

        if not nombre or len(nombre) < 10 or len(nombre) > 255:
            errores["nombre"] = "Nombre inválido (entre 10 y 255 caracteres)."

        if not contrasenna or not re.search(r'\d', contrasenna) or contrasenna == "1234" or len(contrasenna) > 255:
            errores["contrasenna"] = "Contraseña inválida (debe contener números y no ser '1234')."

        telefono_regex = r'^\+?[0-9\s\-]{7,15}$'
        if not telefono or not re.match(telefono_regex, telefono):
            errores["telefono"] = "Teléfono inválido (solo números, entre 7 y 15 dígitos)."
        
        comuna_id_int = a_entero(comuna_id)
        if comuna_id_int is None:
            errores["comuna"] = "Debes seleccionar una comuna."
        elif not db.query(Comuna).filter(Comuna.id == comuna_id_int).first():
            errores["comuna"] = "Comuna no válida."
        
            #verificar email duplicado
        if "email" not in errores:
            if db.query(Voluntario).filter(Voluntario.email == email).first():
                    errores["email"] = "Este email ya está registrado."
        
        if errores:
            return render_template("registro-voluntario.html",
                                   regiones=regiones, comunas=comunas,
                                   errores=errores, valores=valores)

        #insertar
        nuevo = Voluntario(
            nombre=nombre,
            email=email,
            contrasenna=contrasenna,
            telefono=telefono,
            comuna_id=comuna_id_int,
            fecha_registro=datetime.now(),
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        flash("Voluntario registrado exitosamente :)", "success")

        return redirect(url_for("informar_avistamiento", voluntario_id=nuevo.id))
    
    finally:
        db.close()


@app.route('/informar-avistamiento', methods=["GET", "POST"])
def informar_avistamiento():
    db = get_db()
    try:
        voluntarios = db.query(Voluntario).order_by(Voluntario.nombre).all()
        aves = db.query(Ave).order_by(Ave.nombre).all()
        regiones = db.query(Region).order_by(Region.nombre).all()

        # si es que ya se registro
        voluntario_id_pre = request.args.get("voluntario_id", "")

        if request.method == "GET":
            return render_template('informar-avistamiento.html',
                                   voluntarios=voluntarios,
                                   aves=aves,
                                   regiones=regiones,
                                   voluntario_id_pre=voluntario_id_pre,
                                   errores={}, valores={})

        voluntario_id = request.form.get("voluntario_id", "").strip()
        ave_id        = request.form.get("ave_id", "").strip()
        lugar         = request.form.get("lugar", "").strip()
        fecha         = request.form.get("fecha", "").strip()
        hora          = request.form.get("hora", "").strip()
        descripcion   = request.form.get("descripcion", "").strip()
        archivos      = request.files.getlist("archivos")

        valores = {
            "voluntario_id": voluntario_id,
            "ave_id":        ave_id,
            "lugar":         lugar,
            "fecha":         fecha,
            "hora":          hora,
            "descripcion":   descripcion,
        }

        #validaci'on

        errores = {}

        voluntario_id_int = a_entero(voluntario_id)
        if voluntario_id_int is None or not db.query(Voluntario).filter(Voluntario.id == voluntario_id_int).first():
            errores["voluntario"] = "Debes seleccionar un voluntario válido."

        ave_id_int = a_entero(ave_id)
        if ave_id_int is None or not db.query(Ave).filter(Ave.id == ave_id_int).first():
            errores["ave"] = "Debes seleccionar un ave válida."

        if not lugar or len(lugar) > 200:
            errores["lugar"] = "Debes ingresar el lugar de avistamiento (máximo 200 caracteres)."

        fecha_hora_dt = None
        fecha_regex = r'^\d{2}-\d{2}-\d{4}$'
        if not re.match(fecha_regex, fecha):
            errores["fecha"] = "Fecha inválida. Usar DD-MM-AAAA."
        else:
            try:
                fecha_dt = datetime.strptime(fecha, "%d-%m-%Y")
                if fecha_dt > datetime.now():
                    errores["fecha"] = "La fecha no puede estar en el futuro."
            except ValueError:
                errores["fecha"] = "Fecha inválida."

        hora_regex = r'^([01]\d|2[0-3]):([0-5]\d)$'
        if not re.match(hora_regex, hora):
            errores["hora"] = "Hora inválida. Use HH:MM."

        if "fecha" not in errores and "hora" not in errores:
            fecha_hora_dt = datetime.strptime(f"{fecha} {hora}", "%d-%m-%Y %H:%M")


        archivos_validos = [f for f in archivos
                            if f and f.filename and allowed_file(f.filename)]

        if not archivos_validos:
            errores["archivos"] = """Debes subir al menos un archivo .png, .jpg,
                                     .jpeg, .gif, .mp4, .mov, .avi o .webm
                                  """

        if errores:
            return render_template("informar-avistamiento.html",
            voluntarios=voluntarios,
            aves=aves,
            regiones=regiones,
            voluntario_id_pre=voluntario_id_pre,
            errores=errores, valores=valores)

        nuevo_av = Avistamiento(
            fecha_hora=fecha_hora_dt,
            lugar=lugar,
            descripcion=descripcion if descripcion else None,
            ave_id=ave_id_int,
            voluntario_id=int(voluntario_id),
        )
        db.add(nuevo_av)
        db.flush()

        for file in archivos_validos:
            filename = secure_filename(file.filename)
            unique_name = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}_{filename}"
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
            file.save(filepath)

            nuevo_reg = Registro(
                avistamiento_id=nuevo_av.id,
                ruta_archivo=unique_name,
                nombre_archivo=filename,
            )
            db.add(nuevo_reg)
        
        db.commit()
        flash("Avistamiento registrado exitosamente. Gracias por tu aporte", "success")
        return redirect(url_for("index"))
    
    finally:
        db.close()

@app.route('/listado-avistamiento')
def listado_avistamiento():
    db = get_db()
    try:
        aves = db.query(Ave).order_by(Ave.nombre).all()

        page = request.args.get("page", 1, type=int)
        if page < 1:
            page = 1
        ave_id_int = a_entero(request.args.get("ave_id", ""))
        ave_id = str(ave_id_int) if ave_id_int else ""
        ordenar = request.args.get("ordenar", "fecha-desc")
        if ordenar not in ("fecha-desc", "fecha-asc", "lugar-asc"):
            ordenar = "fecha-desc"
        
        per_page = 5
        offset = (page - 1) * per_page
        
        query = db.query(Avistamiento)
        
        if ave_id:
            query = query.filter(Avistamiento.ave_id == int(ave_id))
            
        if ordenar == "fecha-asc":
            query = query.order_by(Avistamiento.fecha_hora.asc())
        elif ordenar == "lugar-asc":
            query = query.order_by(Avistamiento.lugar.asc())
        else:
            query = query.order_by(Avistamiento.fecha_hora.desc())
            
        total = query.count()
        total_pages = max(1, (total + per_page - 1) // per_page)
        if page > total_pages:
            page = total_pages
            offset = (page - 1) * per_page
        avistamientos = query.offset(offset).limit(per_page).all()

        return render_template("listado-avistamiento.html",
                               avistamientos=avistamientos,
                               aves=aves,
                               page=page,
                               total_pages=total_pages,
                               ave_id=ave_id,
                               ordenar=ordenar)
    finally:
        db.close()

#detalle
@app.route("/avistamiento/<int:id>")
def detalle_avistamiento(id):
    db = get_db()
    try:
        avistamiento = db.query(Avistamiento).filter(Avistamiento.id == id).first()
        if not avistamiento:
            abort(404)
        return render_template("detalle-avistamiento.html", avistamiento=avistamiento)
    finally:
        db.close()

@app.route('/metricas')
def metricas():
    return render_template('metricas.html')

@app.route('/datos-avistamientos-dia', methods=['GET'])
def datos_avistamientos_dia():
    db = get_db()
    try:
        sql = text("""
            SELECT DATE(fecha_hora) AS dia, COUNT(*) AS total
            FROM avistamiento
            GROUP BY DATE(fecha_hora)
            ORDER BY dia ASC
        """)
        filas = db.execute(sql).mappings().all()
        datos = []
        for fila in filas:
            datos.append([fila["dia"].strftime("%d-%m-%Y"), fila["total"]])
        return respuesta_json(datos)
    finally:
        db.close()

@app.route('/datos-avistamientos-ave', methods=['GET'])
def datos_avistamientos_ave():
    db = get_db()
    try:
        sql = text("""
            SELECT ave.nombre AS ave, COUNT(avistamiento.id) AS total
            FROM avistamiento
            JOIN ave ON avistamiento.ave_id = ave.id
            GROUP BY ave.id, ave.nombre
            ORDER BY total DESC, ave.nombre ASC
        """)
        filas = db.execute(sql).mappings().all()
        datos = []
        for fila in filas:
            datos.append([fila["ave"], fila["total"]])
        return respuesta_json(datos)
    finally:
        db.close()

@app.route('/datos-voluntarios-comuna', methods=['GET'])
def datos_voluntarios_comuna():
    db = get_db()
    try:
        sql = text("""
            SELECT comuna.nombre AS comuna, COUNT(voluntario.id) AS total
            FROM voluntario
            JOIN comuna ON voluntario.comuna_id = comuna.id
            GROUP BY comuna.id, comuna.nombre
            ORDER BY total DESC, comuna.nombre ASC
        """)
        filas = db.execute(sql).mappings().all()
        datos = []
        for fila in filas:
            datos.append([fila["comuna"], fila["total"]])
        return respuesta_json(datos)
    finally:
        db.close()

def validar_comentario(nombre, texto):
    """Valida en el servidor las mismas reglas que valida el cliente.
    Retorna un diccionario {campo: mensaje}; vacío si todo está bien."""
    errores = {}
    if len(nombre) < 3 or len(nombre) > 50:
        errores["nombre"] = "El nombre es obligatorio y debe tener entre 3 y 50 caracteres."
    if len(texto) < 5 or len(texto) > 300:
        errores["texto"] = "El comentario es obligatorio y debe tener entre 5 y 300 caracteres."
    return errores


@app.route('/avistamiento/<int:id>/comentarios', methods=['GET'])
def listar_comentarios(id):
    db = get_db()
    try:
        avistamiento = db.query(Avistamiento).filter(Avistamiento.id == id).first()
        if not avistamiento:
            return respuesta_json({"ok": False, "errores": {"general": "El avistamiento no existe."}}, 404)

        comentarios = (db.query(Comentario)
                       .filter(Comentario.avistamiento_id == id)
                       .order_by(Comentario.fecha.desc(), Comentario.id.desc())
                       .all())
        datos = []
        for c in comentarios:
            datos.append({
                "fecha": c.fecha.strftime("%d-%m-%Y %H:%M"),
                "nombre": c.nombre,
                "texto": c.texto,
            })
        return respuesta_json(datos)
    finally:
        db.close()


@app.route('/avistamiento/<int:id>/comentarios', methods=['POST'])
def agregar_comentario(id):
    db = get_db()
    try:
        avistamiento = db.query(Avistamiento).filter(Avistamiento.id == id).first()
        if not avistamiento:
            return respuesta_json({"ok": False, "errores": {"general": "El avistamiento no existe."}}, 404)

        nombre = request.form.get("nombre", "").strip()
        texto = request.form.get("texto", "").strip()

        errores = validar_comentario(nombre, texto)
        if errores:
            return respuesta_json({"ok": False, "errores": errores}, 400)

        nuevo = Comentario(
            nombre=nombre,
            texto=texto,
            fecha=datetime.now(),
            avistamiento_id=id,
        )
        try:
            db.add(nuevo)
            db.commit()
        except Exception as e:
            app.logger.error("Error con base de datos: {0} ".format(str(e)))
            db.rollback()
            return respuesta_json({"ok": False, "errores": {"general": "No se pudo guardar el comentario."}}, 500)

        return respuesta_json({"ok": True}, 201)
    finally:
        db.close()

if __name__ == '__main__':
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")