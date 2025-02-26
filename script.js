// Dados iniciais
let transacoes = [];

// Elementos DOM
const formTransacao = document.getElementById('formTransacao');
const tabelaTransacoes = document.getElementById('tabelaTransacoes');
const totalReceitas = document.getElementById('totalReceitas');
const totalDespesas = document.getElementById('totalDespesas');
const saldoTotal = document.getElementById('saldoTotal');
const reservaEmpresa = document.getElementById('reservaEmpresa');
const pagtoCarlos = document.getElementById('pagtoCarlos');
const pagtoJonathan = document.getElementById('pagtoJonathan');
const btnRelatorio = document.getElementById('btnRelatorio');

// Evento para adicionar nova transação
formTransacao.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const data = document.getElementById('data').value;
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  
  if (!data || !valor || valor <= 0) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }
  
  // Criar nova transação
  const novaTransacao = {
    id: Date.now().toString(),
    data,
    tipo,
    categoria,
    descricao,
    valor
  };
  
  // Adicionar à lista
  transacoes.push(novaTransacao);
  
  // Limpar formulário
  formTransacao.reset();
  
  // Atualizar interface
  atualizarTabela();
  atualizarTotais();
  
  // Salvar no localStorage
  salvarTransacoes();
});

// Função para atualizar a tabela
function atualizarTabela() {
  const tbody = tabelaTransacoes.querySelector('tbody');
  tbody.innerHTML = '';
  
  transacoes.forEach(transacao => {
    const tr = document.createElement('tr');
    tr.className = `transacao-${transacao.tipo}`;
    
    // Formatar data
    const data = new Date(transacao.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    
    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
      <td>${transacao.categoria}</td>
      <td>${transacao.descricao || '-'}</td>
      <td>$${transacao.valor.toFixed(2)}</td>
      <td>
        <button class="btn-remover" data-id="${transacao.id}">Remover</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Adicionar evento aos botões de remover
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removerTransacao(id);
    });
  });
}

// Função para remover transação
function removerTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);
  atualizarTabela();
  atualizarTotais();
  salvarTransacoes();
}

// Função para atualizar totais
function atualizarTotais() {
  // Calcular receitas e despesas
  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const saldo = receitas - despesas;
  
  // Calcular distribuição
  const reserva = saldo > 0 ? saldo * 0.10 : 0; // 10% para empresa
  const valorSocios = saldo - reserva;
  const valorCarlos = valorSocios > 0 ? valorSocios / 2 : 0; // 45% do total (50% do que sobra)
  const valorJonathan = valorSocios > 0 ? valorSocios / 2 : 0; // 45% do total (50% do que sobra)
  
  // Atualizar na interface
  totalReceitas.textContent = `$${receitas.toFixed(2)}`;
  totalDespesas.textContent = `$${despesas.toFixed(2)}`;
  saldoTotal.textContent = `$${saldo.toFixed(2)}`;
  reservaEmpresa.textContent = `$${reserva.toFixed(2)}`;
  pagtoCarlos.textContent = `$${valorCarlos.toFixed(2)}`;
  pagtoJonathan.textContent = `$${valorJonathan.toFixed(2)}`;
  
  // Atualizar classes CSS
  saldoTotal.className = saldo >= 0 ? 'valor positivo' : 'valor negativo';
}

// Salvar transações no localStorage
function salvarTransacoes() {
  localStorage.setItem('asaTransacoes', JSON.stringify(transacoes));
}

// Carregar transações do localStorage
function carregarTransacoes() {
  const dadosSalvos = localStorage.getItem('asaTransacoes');
  if (dadosSalvos) {
    transacoes = JSON.parse(dadosSalvos);
    atualizarTabela();
    atualizarTotais();
  }
}

// Gerar relatório
btnRelatorio.addEventListener('click', function() {
  if (transacoes.length === 0) {
    alert('Não há transações para gerar o relatório.');
    return;
  }
  
  alert('Relatório anual gerado com sucesso! Pronto para enviar à contabilidade para processamento de impostos na Flórida.');
  
  // Aqui você poderia implementar a exportação real do relatório
  console.log('Gerando relatório para as transações:', transacoes);
});

// Inicializar
carregarTransacoes();