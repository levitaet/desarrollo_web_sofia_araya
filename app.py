from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = "miau"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/registro-voluntario')
def registro_voluntario():
    return render_template('registro-voluntario.html')

@app.route('/informar-avistamiento')
def informar_avistamiento():
    return render_template('informar-avistamiento.html')

@app.route('/listado-avistamiento')
def listado_avistamiento():
    return render_template('listado-avistamiento.html')

@app.route('/metricas')
def metricas():
    return render_template('metricas.html')

if __name__ == '__main__':
    app.run(debug=True)