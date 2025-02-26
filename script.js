// Supabase configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initial data
let transacoes = [];
let semanaAtual = {
  inicio: "",
  fim: "",
  notas: ""
};
let semanasSalvas = [];

// DOM Elements
const formTransacao = document.getElementById('formTransacao');
const formSemana = document.getElementById('formSemana');
const tabelaTransacoes = document.getElementById('tabelaTransacoes');
const totalReceitas = document.getElementById('totalReceitas');
const totalDespesas = document.getElementById('totalDespesas');
const saldoTotal = document.getElementById('saldoTotal');
const btnRelatorio = document.getElementById('btnRelatorio');
const resumoSemanalCard = document.getElementById('resumoSemanalCard');

// Initialize Supabase client
document.addEventListener('DOMContentLoaded', function() {
  inicializarSupabase();
  
  // Set up event listeners
  if (formTransacao) {
    formTransacao.addEventListener('submit', adicionarTransacao);
  }
  
  if (formSemana) {
    formSemana.addEventListener('submit', definirSemana);
  }
  
  if (btnRelatorio) {
    btnRelatorio.addEventListener('click', gerarRelatorio);
  }
  
  const dataInicio = document.getElementById('dataInicio');
  if (dataInicio) {
    dataInicio.addEventListener('change', e => {
      semanaAtual.inicio = e.target.value;
    });
  }
  
  const dataFim = document.getElementById('dataFim');
  if (dataFim) {
    dataFim.addEventListener('change', e => {
      semanaAtual.fim = e.target.value;
    });
  }
  
  const notasSemana = document.getElementById('notasSemana');
  if (notasSemana) {
    notasSemana.addEventListener('input', e => {
      semanaAtual.notas = e.target.value;
    });
  }
  
  // Hide weekly summary card initially
  if (resumoSemanalCard) {
    resumoSemanalCard.style.display = 'none';
  }
});

// Initialize Supabase
function inicializarSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('Supabase not configured. Using localStorage only.');
    carregarTransacoes();
    carregarSemanas();
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = function() {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    carregarTransacoes();
    carregarSemanas();
  };
  document.head.appendChild(script);
}

// Event for adding a new transaction
function adicionarTransacao(e) {
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
  if (semanaAtual.inicio && semanaAtual.fim) {
    atualizarResumoSemanal();
  }
  
  // Save to database
  salvarTransacao(novaTransacao);
}

// Set current week
function definirSemana(e) {
  e.preventDefault();
  
  if (!semanaAtual.inicio || !semanaAtual.fim) {
    alert("Please set start and end dates for the week");
    return;
  }

  const novasSemanas = [...semanasSalvas];
  const semanaExistente = novasSemanas.findIndex(
    s => s.inicio === semanaAtual.inicio && s.fim === semanaAtual.fim
  );

  const transacoesSemana = transacoesDaSemana();

  if (semanaExistente === -1) {
    // Add new week
    novasSemanas.push({
      ...semanaAtual,
      id: Date.now().toString(),
      transacoes: transacoesSemana
    });
  } else {
    // Update existing week
    novasSemanas[semanaExistente] = {
      ...novasSemanas[semanaExistente],
      notas: semanaAtual.notas,
      transacoes: transacoesSemana
    };
  }

  semanasSalvas = novasSemanas;
  salvarSemanas();
  atualizarListaSemanas();
  atualizarResumoSemanal();
  
  // Show weekly summary card
  if (resumoSemanalCard) {
    resumoSemanalCard.style.display = 'block';
  }
  
  alert("Week saved successfully!");
}

// Filter transactions for the current week
function transacoesDaSemana() {
  if (!semanaAtual.inicio || !semanaAtual.fim) return transacoes;
  
  return transacoes.filter(t => {
    const dataTransacao = new Date(t.data);
    const inicioSemana = new Date(semanaAtual.inicio);
    const fimSemana = new Date(semanaAtual.fim);
    return dataTransacao >= inicioSemana && dataTransacao <= fimSemana;
  });
}

// Load a selected week
function carregarSemana(semana) {
  semanaAtual = {
    inicio: semana.inicio,
    fim: semana.fim,
    notas: semana.notas || ""
  };
  
  document.getElementById('dataInicio').value = semana.inicio;
  document.getElementById('dataFim').value = semana.fim;
  document.getElementById('notasSemana').value = semana.notas || "";
  
  // Update the UI to show weekly summary
  atualizarResumoSemanal();
  
  // Show weekly summary card
  if (resumoSemanalCard) {
    resumoSemanalCard.style.display = 'block';
  }
}

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
  // Remove from local array
  transacoes = transacoes.filter(t => t.id !== id);
  
  // Update UI
  atualizarTabela();
  atualizarTotais();
  if (semanaAtual.inicio && semanaAtual.fim) {
    atualizarResumoSemanal();
  }
  
  // Remove from database
  removerTransacaoDatabase(id);
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
  
  // Update interface
  totalReceitas.textContent = `$${receitas.toFixed(2)}`;
  totalDespesas.textContent = `$${despesas.toFixed(2)}`;
  saldoTotal.textContent = `$${saldo.toFixed(2)}`;
  
  // Update CSS classes
  saldoTotal.className = saldo >= 0 ? 'valor positivo' : 'valor negativo';
}

// Update weekly summary
function atualizarResumoSemanal() {
  if (!semanaAtual.inicio || !semanaAtual.fim) return;
  
  const transacoes = transacoesDaSemana();
  
  // Calculate totals
  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valor, 0);
    
  const saldo = receitas - despesas;
  const reservaEmpresa = saldo > 0 ? saldo * 0.10 : 0;
  const pagtoCarlos = saldo > 0 ? (saldo - reservaEmpresa) / 2 : 0;
  const pagtoJonathan = saldo > 0 ? (saldo - reservaEmpre
