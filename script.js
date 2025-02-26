Aqui está o script.js traduzido para o inglês:

```javascript
// Initial data
let transacoes = [];

// DOM Elements
const formTransacao = document.getElementById('formTransacao');
const tabelaTransacoes = document.getElementById('tabelaTransacoes');
const totalReceitas = document.getElementById('totalReceitas');
const totalDespesas = document.getElementById('totalDespesas');
const saldoTotal = document.getElementById('saldoTotal');
const reservaEmpresa = document.getElementById('reservaEmpresa');
const pagtoCarlos = document.getElementById('pagtoCarlos');
const pagtoJonathan = document.getElementById('pagtoJonathan');
const btnRelatorio = document.getElementById('btnRelatorio');

// Event for adding a new transaction
formTransacao.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const data = document.getElementById('data').value;
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  
  if (!data || !valor || valor <= 0) {
    alert('Please fill in all fields correctly.');
    return;
  }
  
  // Create new transaction
  const novaTransacao = {
    id: Date.now().toString(),
    data,
    tipo,
    categoria,
    descricao,
    valor
  };
  
  // Add to the list
  transacoes.push(novaTransacao);
  
  // Clear form
  formTransacao.reset();
  
  // Update interface
  atualizarTabela();
  atualizarTotais();
  
  // Save to localStorage
  salvarTransacoes();
});

// Function to update the table
function atualizarTabela() {
  const tbody = tabelaTransacoes.querySelector('tbody');
  tbody.innerHTML = '';
  
  transacoes.forEach(transacao => {
    const tr = document.createElement('tr');
    tr.className = `transacao-${transacao.tipo}`;
    
    // Format date
    const data = new Date(transacao.data);
    const dataFormatada = data.toLocaleDateString('en-US');
    
    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${transacao.tipo === 'receita' ? 'Income' : 'Expense'}</td>
      <td>${transacao.categoria}</td>
      <td>${transacao.descricao || '-'}</td>
      <td>$${transacao.valor.toFixed(2)}</td>
      <td>
        <button class="btn-remover" data-id="${transacao.id}">Remove</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Add event to remove buttons
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removerTransacao(id);
    });
  });
}

// Function to remove transaction
function removerTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);
  atualizarTabela();
  atualizarTotais();
  salvarTransacoes();
}

// Function to update totals
function atualizarTotais() {
  // Calculate income and expenses
  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const saldo = receitas - despesas;
  
  // Calculate distribution
  const reserva = saldo > 0 ? saldo * 0.10 : 0; // 10% for company
  const valorSocios = saldo - reserva;
  const valorCarlos = valorSocios > 0 ? valorSocios / 2 : 0; // 45% of total (50% of remainder)
  const valorJonathan = valorSocios > 0 ? valorSocios / 2 : 0; // 45% of total (50% of remainder)
  
  // Update interface
  totalReceitas.textContent = `$${receitas.toFixed(2)}`;
  totalDespesas.textContent = `$${despesas.toFixed(2)}`;
  saldoTotal.textContent = `$${saldo.toFixed(2)}`;
  reservaEmpresa.textContent = `$${reserva.toFixed(2)}`;
  pagtoCarlos.textContent = `$${valorCarlos.toFixed(2)}`;
  pagtoJonathan.textContent = `$${valorJonathan.toFixed(2)}`;
  
  // Update CSS classes
  saldoTotal.className = saldo >= 0 ? 'valor positivo' : 'valor negativo';
}

// Save transactions to localStorage
function salvarTransacoes() {
  localStorage.setItem('asaTransacoes', JSON.stringify(transacoes));
}

// Load transactions from localStorage
function carregarTransacoes() {
  const dadosSalvos = localStorage.getItem('asaTransacoes');
  if (dadosSalvos) {
    transacoes = JSON.parse(dadosSalvos);
    atualizarTabela();
    atualizarTotais();
  }
}

// Generate report
btnRelatorio.addEventListener('click', function() {
  if (transacoes.length === 0) {
    alert('There are no transactions to generate the report.');
    return;
  }
  
  alert('Annual report generated successfully! Ready to send to accounting for Florida tax processing.');
  
  // Here you could implement the actual report export
  console.log('Generating report for transactions:', transacoes);
});

// Initialize
carregarTransacoes();
```

