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

carregar();
