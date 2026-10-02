import os
import re
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import (Flask, render_template, request,
                   redirect, url_for, flash, abort, jsonify)

from db import get_db
from models import Voluntario, Avistamiento, Registro, Ave, Region, Comuna


app = Flask(__name__)
app.secret_key = "miau"

UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXT = {"png", "jpg", "jpeg", "gif", "mp4", "mov", "avi", "webm"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

@app.route('/')
def index():
    db = get_db()
    try:
        ultimos = (db.query(Avistamiento)
        .order_by(Avistamiento.id.desc())
        .limit(2)
        .all())
    finally:
        db.close()
    return render_template('index.html', avistamientos=ultimos)


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
        email = request.form.get("email", "").strip()
        nombre_completo = request.form.get("nombre-completo", "").strip()
        contrasenna = request.form.get("contrasenna", "").strip()
        comuna_id = request.form.get("comunas", "").strip()

        valores = {
            "email": email,
            "nombre_completo": nombre_completo,
            "comuna_id": comuna_id,
        }

        #validaciones
        errores = {}
        mail_regex = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'

        if not re.match(mail_regex, email):
            errores["email"] = "Email inválido"

        if not nombre_completo or len(nombre_completo) < 10 or len(nombre_completo) > 155:
            errores["nombre"] = "Nombre inválido (entre 10 y 155 caracteres)."
        
        if not contrasenna or not re.search(r'\d', contrasenna) or contrasenna == "1234":
            errores["contrasenna"] = "Contraseña inválida (debe contener números y no ser '1234')"
        
        if not comuna_id:
            errores["comuna"] = "Debes seleccionar una comuna"
        
        else:
            #verificar id de comuna en la bdd
            if not db.query(Comuna).filter(Comuna.id == int(comuna_id)).first():
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
            nombre_completo=nombre_completo,
            email=email,
            contrasenna=contrasenna,
            comuna_id=int(comuna_id),
            fecha_registro = datetime.now()
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
        voluntarios = db.query(Voluntario).order_by(Voluntario.nombre_completo).all()
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
        
        #POST
        voluntario_id = request.form.get("voluntario_id", "").strip()
        ave_id = request.form.get("ave_id", "").strip()
        lugar = request.form.get("lugar", "").strip()
        fecha = request.form.get("fecha", "").strip()
        hora = request.form.get("hora", "").strip()
        archivos = request.files.getlist("archivos")

        valores = {
            "voluntario_id": voluntario_id,
            "ave_id": ave_id,
            "lugar": lugar,
            "fecha": fecha,
            "hora": hora,
        }

        #validaci'on

        errores = {}

        if not voluntario_id:
            errores["voluntario"] = "Debes seleccionar un voluntario."

        if not ave_id:
            errores["ave"] = "Debes seleccionar un ave."

        if not lugar:
            errores["lugar"] = "Debes ingresar el lugar de avistamiento."

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

        if not re.match(r'^([01]\d|2[0-3]):([0-5]\d)$', hora):
            errores["hora"] = "Hora inválida. Use HH:MM."

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
            fecha=fecha,
            hora=hora,
            lugar=lugar,
            ave_id=int(ave_id),
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
        page = request.args.get("page", 1, type=int)
        per_page = 5
        offset = (page - 1) * per_page
        total = db.query(Avistamiento).count()
        avistamientos = (db.query(Avistamiento)
                         .order_by(Avistamiento.id.desc())
                         .offset(offset)
                         .limit(per_page)
                         .all())
        total_pages = max(1, (total + per_page - 1) // per_page)
    finally:
        db.close()
    return render_template("listado-avistamiento.html",
                           avistamientos=avistamientos,
                           page=page,
                           total_pages=total_pages)

#detalle
@app.route("/avistamiento/<int:id>")
def detalle_avistamiento(id):
    db = get_db()
    try:
        avistamiento = db.query(Avistamiento).filter(Avistamiento.id == id).first()
        if not avistamiento:
            abort(404)
    finally:
        db.close()
    return render_template("detalle-avistamiento.html", avistamiento=avistamiento)

@app.route('/metricas')
def metricas():
    return render_template('metricas.html')


if __name__ == '__main__':
    app.run(debug=True)