from flask import Blueprint, request, jsonify, render_template
import sqlite3

areas_bp = Blueprint('areas', __name__)

DATABASE = 'database/funcionarios.db'


def _get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@areas_bp.route('/areas')
def pagina_areas():
    return render_template('areas.html')


@areas_bp.route('/api/areas', methods=['GET'])
def listar_areas():
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM areas ORDER BY nome')
    dados = cursor.fetchall()
    conn.close()
    return jsonify([{'id': d['id'], 'nome': d['nome']} for d in dados])


@areas_bp.route('/api/areas', methods=['POST'])
def criar_area():
    data = request.get_json() or {}
    nome = (data.get('nome') or '').strip()
    if not nome:
        return jsonify({'erro': 'Nome da area obrigatorio'}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO areas (nome) VALUES (?)', (nome,))
        conn.commit()
        area_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': area_id, 'nome': nome}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'erro': 'Area ja existe'}), 409


@areas_bp.route('/api/areas/<int:area_id>', methods=['DELETE'])
def remover_area(area_id):
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM funcionario_area WHERE area_id = ?', (area_id,))
    cursor.execute('DELETE FROM areas WHERE id = ?', (area_id,))
    conn.commit()
    removidas = cursor.rowcount
    conn.close()
    if removidas == 0:
        return jsonify({'erro': 'Area nao encontrada'}), 404
    return jsonify({'mensagem': 'Area removida'}), 200


@areas_bp.route('/api/funcionarios/<int:fid>/areas', methods=['POST'])
def atrelar_area(fid):
    data = request.get_json() or {}
    area_id = data.get('area_id')
    if not area_id:
        return jsonify({'erro': 'area_id obrigatorio'}), 400

    conn = _get_db()
    cursor = conn.cursor()

    if not cursor.execute('SELECT 1 FROM funcionarios WHERE id = ?', (fid,)).fetchone():
        conn.close()
        return jsonify({'erro': 'Funcionario nao encontrado'}), 404
    if not cursor.execute('SELECT 1 FROM areas WHERE id = ?', (area_id,)).fetchone():
        conn.close()
        return jsonify({'erro': 'Area nao encontrada'}), 404

    try:
        cursor.execute(
            'INSERT INTO funcionario_area (funcionario_id, area_id) VALUES (?, ?)',
            (fid, area_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'mensagem': 'Funcionario atrelado a area'}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'erro': 'Vinculo ja existe'}), 409


@areas_bp.route('/api/funcionarios/<int:fid>/areas', methods=['GET'])
def areas_do_funcionario(fid):
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.nome FROM areas a
        JOIN funcionario_area fa ON fa.area_id = a.id
        WHERE fa.funcionario_id = ?
        ORDER BY a.nome
    """, (fid,))
    dados = cursor.fetchall()
    conn.close()
    return jsonify([{'id': d['id'], 'nome': d['nome']} for d in dados])


@areas_bp.route('/api/funcionarios/<int:fid>/areas/<int:area_id>', methods=['DELETE'])
def desatrelar_area(fid, area_id):
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute(
        'DELETE FROM funcionario_area WHERE funcionario_id = ? AND area_id = ?',
        (fid, area_id)
    )
    conn.commit()
    removidas = cursor.rowcount
    conn.close()
    if removidas == 0:
        return jsonify({'erro': 'Vinculo nao encontrado'}), 404
    return jsonify({'mensagem': 'Vinculo removido'}), 200


@areas_bp.route('/api/areas/<int:area_id>/funcionarios', methods=['GET'])
def funcionarios_da_area(area_id):
    conn = _get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.id, f.nome, f.tempo_empresa, f.eh_freela
        FROM funcionarios f
        JOIN funcionario_area fa ON fa.funcionario_id = f.id
        WHERE fa.area_id = ?
        ORDER BY f.nome
    """, (area_id,))
    dados = cursor.fetchall()
    conn.close()
    return jsonify([{
        'id': d['id'],
        'nome': d['nome'],
        'tempo_empresa': d['tempo_empresa'],
        'eh_freela': bool(d['eh_freela'])
    } for d in dados])
