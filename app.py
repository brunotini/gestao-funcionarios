from flask import Flask, request, jsonify, render_template
import sqlite3
import os

app = Flask(__name__)
DATABASE = 'database/funcionarios.db'

def init_db():
    os.makedirs('database', exist_ok=True)
    conn = sqlite3.connect(DATABASE)
    with open('database/schema.sql', 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/funcionarios', methods=['POST'])
def cadastrar():
    data = request.get_json()
    nome = data.get('nome')
    tempo = data.get('tempo_empresa')
    freela = 1 if data.get('eh_freela') else 0
    
    if not nome:
        return jsonify({'erro': 'Nome obrigatorio'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO funcionarios (nome, tempo_empresa, eh_freela) VALUES (?, ?, ?)',
                   (nome, tempo, freela))
    conn.commit()
    conn.close()
    
    return jsonify({'mensagem': 'Funcionario cadastrado!'}), 201

@app.route('/api/funcionarios', methods=['GET'])
def listar():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM funcionarios ORDER BY id DESC')
    dados = cursor.fetchall()
    conn.close()
    
    lista = []
    for d in dados:
        lista.append({
            'id': d['id'],
            'nome': d['nome'],
            'tempo_empresa': d['tempo_empresa'],
            'eh_freela': bool(d['eh_freela'])
        })
    
    return jsonify(lista)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)