document.getElementById('formFuncionario').addEventListener('submit', function(e) {
    e.preventDefault();

    var nome = document.getElementById('nome').value;
    var tempo = document.getElementById('tempo_empresa').value;
    var freela = document.getElementById('eh_freela').value === 'sim';

    fetch('/api/funcionarios', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            nome: nome,
            tempo_empresa: tempo,
            eh_freela: freela
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(dados) {
        var msg = document.getElementById('mensagem');
        if (dados.erro) {
            msg.textContent = dados.erro;
            msg.style.color = 'red';
        } else {
            msg.textContent = 'Funcionario cadastrado com sucesso!';
            msg.style.color = 'green';
            document.getElementById('formFuncionario').reset();
            carregar();
        }
    });
});

function carregar() {
    fetch('/api/funcionarios')
    .then(function(r) { return r.json(); })
    .then(function(lista) {
        var tabela = document.getElementById('tabela');
        var vazio = document.getElementById('vazio');
        tabela.innerHTML = '';

        if (lista.length === 0) {
            vazio.style.display = 'block';
        } else {
            vazio.style.display = 'none';
        }

        var freelas = 0;
        var fixos = 0;

        for (var i = 0; i < lista.length; i++) {
            var f = lista[i];
            if (f.eh_freela) {
                freelas++;
            } else {
                fixos++;
            }
            var linha = '<tr>' +
                '<td>' + f.id + '</td>' +
                '<td>' + f.nome + '</td>' +
                '<td>' + f.tempo_empresa + '</td>' +
                '<td>' + (f.eh_freela ? 'Sim' : 'Nao') + '</td>' +
                '</tr>';
            tabela.innerHTML += linha;
        }

        document.getElementById('totalFuncionarios').textContent = lista.length;
        document.getElementById('totalFreelas').textContent = freelas;
        document.getElementById('totalFixos').textContent = fixos;
    });
}

async function carregarAreas() {
    const res = await fetch('/api/areas');
    const areas = await res.json();

    for (const id of ['area-select', 'area-filtro']) {
        const sel = document.getElementById(id);
        if (!sel) continue;
        const valorAtual = sel.value;
        sel.innerHTML = areas.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
        if (valorAtual) sel.value = valorAtual;
    }

    const ul = document.getElementById('lista-areas');
    ul.innerHTML = areas.map(a => `
        <li class="item-lista">
            <span>${a.nome}</span>
            <button class="btn-excluir" onclick="removerArea(${a.id})">Excluir</button>
        </li>
    `).join('') || '<li>Nenhuma área cadastrada ainda.</li>';

    carregarFuncionarios();
}

async function criarArea() {
    const input = document.getElementById('nova-area');
    const nome = input.value.trim();
    if (!nome) return alert('Digite o nome da área');

    const res = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.erro || 'Erro ao criar área');

    input.value = '';
    carregarAreas();
}

async function removerArea(id) {
    if (!confirm('Remover esta área? Os vínculos com funcionários também serão removidos.')) return;
    const res = await fetch(`/api/areas/${id}`, { method: 'DELETE' });
    if (!res.ok) alert('Erro ao remover área');
    carregarAreas();
}

async function atrelar() {
    const fid = document.getElementById('func-id').value;
    const area_id = document.getElementById('area-select').value;
    if (!fid || !area_id) return alert('Preencha o ID do funcionário e escolha uma área');

    const res = await fetch(`/api/funcionarios/${fid}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_id: parseInt(area_id) })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.erro || 'Erro ao atrelar');
    alert('Funcionário atrelado com sucesso!');
    document.getElementById('func-id').value = '';
    carregarFuncionarios();
}

async function carregarFuncionarios() {
    const area_id = document.getElementById('area-filtro').value;
    const ul = document.getElementById('lista-funcionarios');
    if (!area_id) {
        ul.innerHTML = '<li>Nenhuma área selecionada.</li>';
        return;
    }
    const res = await fetch(`/api/areas/${area_id}/funcionarios`);
    const funcs = await res.json();
    ul.innerHTML = funcs.map(f => `
        <li>
            ${f.nome} ${f.eh_freela ? '<em>(freelancer)</em>' : ''}
            <button class="btn-excluir" onclick="desatrelar(${f.id}, ${area_id})">Desatrelar</button>
        </li>
    `).join('') || '<li>Nenhum funcionário nesta área.</li>';
}

async function desatrelar(fid, area_id) {
    const res = await fetch(`/api/funcionarios/${fid}/areas/${area_id}`, { method: 'DELETE' });
    if (!res.ok) alert('Erro ao desatrelar');
    carregarFuncionarios();
}

carregar();
carregarAreas();
