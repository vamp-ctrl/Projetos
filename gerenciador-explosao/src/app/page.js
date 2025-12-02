'use client';

import { useState, useEffect } from 'react';
import './globals.css';

export default function Home() {
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [valorInput, setValorInput] = useState('');
  const [descricaoInput, setDescricaoInput] = useState('');
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [trocoPara, setTrocoPara] = useState('');
  const [troco, setTroco] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showResumoDiario, setShowResumoDiario] = useState(false);
  const [resumoDiario, setResumoDiario] = useState(null);

  // Chaves para localStorage
  const PEDIDOS_KEY = 'sistema_pedidos_pedidos';
  const PEDIDO_ATUAL_KEY = 'sistema_pedidos_pedido_atual';
  const ITENS_PEDIDO_KEY = 'sistema_pedidos_itens_pedido';
  const ULTIMO_ID_KEY = 'sistema_pedidos_ultimo_id';

  // Inicializar último ID se não existir
  useEffect(() => {
    if (!localStorage.getItem(ULTIMO_ID_KEY)) {
      localStorage.setItem(ULTIMO_ID_KEY, '1000');
    }
  }, []);

  // Carregar dados do localStorage
  useEffect(() => {
    const carregarDados = () => {
      try {
        setLoading(true);
        
        // Carregar pedidos
        const pedidosSalvos = localStorage.getItem(PEDIDOS_KEY);
        if (pedidosSalvos) {
          setPedidos(JSON.parse(pedidosSalvos));
        }
        
        // Carregar pedido atual (se houver)
        const pedidoAtualSalvo = localStorage.getItem(PEDIDO_ATUAL_KEY);
        if (pedidoAtualSalvo) {
          setPedidoAtual(JSON.parse(pedidoAtualSalvo));
        }
        
        // Carregar itens do pedido atual
        const itensSalvos = localStorage.getItem(ITENS_PEDIDO_KEY);
        if (itensSalvos) {
          setItensPedido(JSON.parse(itensSalvos));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast('Erro ao carregar dados salvos', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  // Salvar dados no localStorage quando mudar
  useEffect(() => {
    if (pedidos.length > 0) {
      localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
    }
  }, [pedidos]);

  useEffect(() => {
    if (pedidoAtual) {
      localStorage.setItem(PEDIDO_ATUAL_KEY, JSON.stringify(pedidoAtual));
    } else {
      localStorage.removeItem(PEDIDO_ATUAL_KEY);
    }
  }, [pedidoAtual]);

  useEffect(() => {
    if (itensPedido.length > 0) {
      localStorage.setItem(ITENS_PEDIDO_KEY, JSON.stringify(itensPedido));
    } else {
      localStorage.removeItem(ITENS_PEDIDO_KEY);
    }
  }, [itensPedido]);

  // Sistema de notificações
  const toast = (mensagem, tipo = 'success') => {
    setToastMessage(mensagem);
    setToastType(tipo);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const gerarNovoId = () => {
    const ultimoId = parseInt(localStorage.getItem(ULTIMO_ID_KEY) || '1000');
    const novoId = ultimoId + 1;
    localStorage.setItem(ULTIMO_ID_KEY, novoId.toString());
    return novoId;
  };

  const adicionarItem = () => {
    if (!valorInput || !descricaoInput) {
      toast('Preencha valor e descrição!', 'error');
      return;
    }

    const valor = parseFloat(valorInput.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast('Valor inválido!', 'error');
      return;
    }

    // Se não tem pedido atual, cria um novo
    if (!pedidoAtual) {
      const novoPedido = {
        id: gerarNovoId(),
        valor_total: valor,
        status: 'pendente',
        created_at: new Date().toISOString()
      };
      setPedidoAtual(novoPedido);
    } else {
      // Atualiza pedido existente
      const pedidoAtualizado = {
        ...pedidoAtual,
        valor_total: parseFloat((pedidoAtual.valor_total + valor).toFixed(2))
      };
      setPedidoAtual(pedidoAtualizado);
    }

    // Adiciona item à lista
    const novoItem = {
      id: Date.now(),
      descricao: descricaoInput,
      valor: valor,
      pedido_id: pedidoAtual?.id || gerarNovoId()
    };
    
    const novosItens = [...itensPedido, novoItem];
    setItensPedido(novosItens);
    
    // Limpa inputs
    setValorInput('');
    setDescricaoInput('');
    
    // Mostra notificação
    toast('Item adicionado com sucesso!');
  };

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.valor, 0);
  };

  const handlePagar = () => {
    if (!pedidoAtual || itensPedido.length === 0) {
      toast('Adicione itens ao pedido primeiro!', 'error');
      return;
    }
    setShowModalPagamento(true);
  };

  const handleTrocoChange = (value) => {
    setTrocoPara(value);
    const valor = parseFloat(value.replace(',', '.'));
    if (!isNaN(valor) && valor > calcularTotal()) {
      setTroco(parseFloat((valor - calcularTotal()).toFixed(2)));
    } else {
      setTroco(null);
    }
  };

  const finalizarPedido = () => {
    if (!formaPagamento) {
      toast('Selecione uma forma de pagamento!', 'error');
      return;
    }

    if (formaPagamento === 'dinheiro' && trocoPara && parseFloat(trocoPara.replace(',', '.')) < calcularTotal()) {
      toast('Valor para troco insuficiente!', 'error');
      return;
    }

    // Atualiza pedido atual
    const pedidoFinalizado = {
      ...pedidoAtual,
      forma_pagamento: formaPagamento,
      troco_para: trocoPara ? parseFloat(trocoPara.replace(',', '.')) : null,
      troco: troco ? troco : null,
      status: 'pago',
      itens: [...itensPedido]
    };

    // Adiciona aos pedidos
    const novosPedidos = [pedidoFinalizado, ...pedidos];
    setPedidos(novosPedidos);

    // Mostra notificação de sucesso
    toast('Pagamento realizado com sucesso!');

    // Limpa tudo
    setPedidoAtual(null);
    setItensPedido([]);
    setShowModalPagamento(false);
    setFormaPagamento('');
    setTrocoPara('');
    setTroco(null);
  };

  const cancelarPedido = () => {
    if (pedidoAtual || itensPedido.length > 0) {
      if (window.confirm('Tem certeza que deseja cancelar o pedido atual?')) {
        setPedidoAtual(null);
        setItensPedido([]);
        toast('Pedido cancelado!', 'error');
      }
    }
  };

  const formasPagamento = [
    { id: 'dinheiro', label: 'Dinheiro' },
    { id: 'pix', label: 'PIX' },
    { id: 'cartao_debito', label: 'Cartão de Débito' },
    { id: 'cartao_credito', label: 'Cartão de Crédito' }
  ];

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const formatarDataSimples = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getFormaPagamentoText = (forma) => {
    const formas = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_debito': 'Cartão Débito',
      'cartao_credito': 'Cartão Crédito'
    };
    return formas[forma] || 'Não informado';
  };

  const limparHistorico = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de pedidos?')) {
      setPedidos([]);
      localStorage.removeItem(PEDIDOS_KEY);
      toast('Histórico limpo com sucesso!');
    }
  };

  const exportarDados = () => {
    try {
      const dados = {
        pedidos,
        exportado_em: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedidos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast('Dados exportados com sucesso!');
    } catch (error) {
      toast('Erro ao exportar dados', 'error');
    }
  };

  const importarDados = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        if (dados.pedidos && Array.isArray(dados.pedidos)) {
          if (window.confirm(`Deseja importar ${dados.pedidos.length} pedidos?`)) {
            setPedidos(dados.pedidos);
            toast(`Importados ${dados.pedidos.length} pedidos com sucesso!`);
          }
        } else {
          toast('Arquivo inválido!', 'error');
        }
      } catch (error) {
        toast('Erro ao ler arquivo', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Função para calcular resumo diário
  const calcularResumoDiario = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    // Filtrar pedidos do dia atual
    const pedidosHoje = pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.created_at).toLocaleDateString('pt-BR');
      return dataPedido === hoje && pedido.status === 'pago';
    });

    // Calcular totais
    let totalDinheiro = 0;
    let totalPix = 0;
    let totalCartaoDebito = 0;
    let totalCartaoCredito = 0;
    let totalTroco = 0;
    let totalVendas = 0;
    let totalPedidos = pedidosHoje.length;

    pedidosHoje.forEach(pedido => {
      const valor = pedido.valor_total;
      
      switch(pedido.forma_pagamento) {
        case 'dinheiro':
          totalDinheiro += valor;
          break;
        case 'pix':
          totalPix += valor;
          break;
        case 'cartao_debito':
          totalCartaoDebito += valor;
          break;
        case 'cartao_credito':
          totalCartaoCredito += valor;
          break;
      }

      if (pedido.troco) {
        totalTroco += pedido.troco;
      }

      totalVendas += valor;
    });

    // Calcular valores em caixa (dinheiro recebido menos troco dado)
    const totalEmCaixa = totalDinheiro - totalTroco;

    setResumoDiario({
      data: hoje,
      totalPedidos,
      totalVendas: parseFloat(totalVendas.toFixed(2)),
      totalDinheiro: parseFloat(totalDinheiro.toFixed(2)),
      totalPix: parseFloat(totalPix.toFixed(2)),
      totalCartaoDebito: parseFloat(totalCartaoDebito.toFixed(2)),
      totalCartaoCredito: parseFloat(totalCartaoCredito.toFixed(2)),
      totalTroco: parseFloat(totalTroco.toFixed(2)),
      totalEmCaixa: parseFloat(totalEmCaixa.toFixed(2)),
      pedidos: pedidosHoje
    });

    setShowResumoDiario(true);
  };

  const exportarResumoPDF = () => {
    // Simples exportação do resumo como texto
    if (!resumoDiario) return;

    const resumoTexto = `
RESUMO DIÁRIO - ${resumoDiario.data}
========================================

TOTAL DE PEDIDOS: ${resumoDiario.totalPedidos}
VALOR TOTAL VENDIDO: R$ ${resumoDiario.totalVendas.toFixed(2)}

FORMA DE PAGAMENTO:
- DINHEIRO: R$ ${resumoDiario.totalDinheiro.toFixed(2)}
- PIX: R$ ${resumoDiario.totalPix.toFixed(2)}
- CARTÃO DÉBITO: R$ ${resumoDiario.totalCartaoDebito.toFixed(2)}
- CARTÃO CRÉDITO: R$ ${resumoDiario.totalCartaoCredito.toFixed(2)}

TROCO TOTAL DADO: R$ ${resumoDiario.totalTroco.toFixed(2)}
TOTAL EM CAIXA: R$ ${resumoDiario.totalEmCaixa.toFixed(2)}

PEDIDOS DO DIA:
${resumoDiario.pedidos.map((pedido, index) => `
${index + 1}. Pedido #${pedido.id}
   Valor: R$ ${pedido.valor_total.toFixed(2)}
   Forma: ${getFormaPagamentoText(pedido.forma_pagamento)}
   ${pedido.troco ? `Troco: R$ ${pedido.troco.toFixed(2)}` : ''}
`).join('')}
========================================
Gerado em: ${new Date().toLocaleString('pt-BR')}
`;

    const blob = new Blob([resumoTexto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_diario_${resumoDiario.data.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast('Resumo exportado com sucesso!');
  };

  return (
    <div className="container">
      {showToast && (
        <div className="toast-container">
          <div className={`toast ${toastType === 'error' ? 'error' : ''}`}>
            {toastMessage}
          </div>
        </div>
      )}
      
      <div className="header">
        <h1>Sistema de Pedidos</h1>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={exportarDados} className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto' }}>
            Exportar Dados
          </button>
          
          {/* CORREÇÃO AQUI - Fechamento correto da label */}
          <label className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto', cursor: 'pointer' }}>
            Importar Dados
            <input 
              type="file" 
              accept=".json" 
              onChange={importarDados} 
              style={{ display: 'none' }}
            />
          </label>
          
          <button onClick={limparHistorico} className="btn btn-secondary" style={{ padding: '8px 16px', width: 'auto' }}>
            Limpar Histórico
          </button>
          <button onClick={calcularResumoDiario} className="btn btn-primary" style={{ padding: '8px 16px', width: 'auto' }}>
            Resumo do Dia
          </button>
        </div>
      </div>

      <div className="grid-container">
        {/* Painel Esquerdo - Formulário */}
        <div>
          <div className="panel">
            <h2>{pedidoAtual ? 'Continuar Pedido' : 'Novo Pedido'}</h2>
            
            <div className="form-group">
              <label htmlFor="descricao">Descrição do Item</label>
              <input
                type="text"
                id="descricao"
                value={descricaoInput}
                onChange={(e) => setDescricaoInput(e.target.value)}
                className="form-control"
                placeholder="Ex: Açai"
                onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="valor">Valor (R$)</label>
              <input
                type="text"
                id="valor"
                value={valorInput}
                onChange={(e) => setValorInput(e.target.value)}
                className="form-control"
                placeholder="R$ 00,00"
                onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={adicionarItem}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Adicionar Item
              </button>
              {(pedidoAtual || itensPedido.length > 0) && (
                <button
                  onClick={cancelarPedido}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '14px 20px' }}
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>

          {/* Itens do Pedido Atual */}
          {itensPedido.length > 0 && (
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Itens do Pedido #{pedidoAtual?.id}</h3>
                <span className="pedido-id">Iniciado em: {formatarData(pedidoAtual?.created_at)}</span>
              </div>
              
              <div className="items-list">
                {itensPedido.map((item) => (
                  <div key={item.id} className="item-row">
                    <span className="item-desc">{item.descricao}</span>
                    <span className="item-value">R$ {item.valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="total-container">
                <div className="total-row">
                  <span>Total:</span>
                  <span>R$ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handlePagar}
                className="btn btn-success"
                style={{ marginTop: '20px' }}
              >
                PAGAR - R$ {calcularTotal().toFixed(2)}
              </button>
            </div>
          )}
        </div>

        {/* Painel Direito - Lista de Pedidos */}
        <div>
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Histórico de Pedidos</h2>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {loading ? (
              <div className="loading">Carregando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div className="loading">
                <p>Nenhum pedido registrado ainda</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Comece adicionando itens à esquerda
                </p>
              </div>
            ) : (
              <div className="pedidos-container">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="pedido-card">
                    <div className="pedido-header">
                      <div>
                        <div className="pedido-id">
                          Pedido #{pedido.id} • {formatarData(pedido.created_at)}
                        </div>
                        <div className="pedido-total">
                          R$ {pedido.valor_total.toFixed(2)}
                        </div>
                      </div>
                      <div className={`status-badge status-${pedido.status}`}>
                        {getStatusText(pedido.status)}
                      </div>
                    </div>
                    
                    <div className="pedido-info">
                      <p>
                        <strong>Pagamento:</strong>{' '}
                        {getFormaPagamentoText(pedido.forma_pagamento)}
                      </p>
                      
                      {pedido.troco && (
                        <p>
                          <strong>Troco:</strong> R$ {pedido.troco.toFixed(2)}
                        </p>
                      )}
                      
                      {pedido.troco_para && (
                        <p>
                          <strong>Pago com:</strong> R$ {pedido.troco_para.toFixed(2)}
                        </p>
                      )}
                      
                      {pedido.itens && (
                        <details style={{ marginTop: '10px' }}>
                          <summary style={{ cursor: 'pointer', color: '#3498db' }}>
                            Ver itens ({pedido.itens.length})
                          </summary>
                          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            {pedido.itens.map((item, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                                <span>{item.descricao}</span>
                                <span>R$ {item.valor.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showModalPagamento && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Finalizar Pagamento</h2>
              <button
                onClick={() => setShowModalPagamento(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ backgroundColor: '#e8f4fc', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#3498db' }}>Total a Pagar</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
                    R$ {calcularTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: '600', color: '#555', marginBottom: '10px' }}>
                  Forma de Pagamento
                </div>
                <div className="payment-options">
                  {formasPagamento.map((forma) => (
                    <button
                      key={forma.id}
                      onClick={() => setFormaPagamento(forma.id)}
                      className={`payment-btn ${formaPagamento === forma.id ? 'selected' : ''}`}
                    >
                      {forma.label}
                    </button>
                  ))}
                </div>
              </div>

              {formaPagamento === 'dinheiro' && (
                <div className="troco-container">
                  <div style={{ marginBottom: '10px', fontWeight: '600' }}>
                    Valor para Troco (opcional)
                  </div>
                  <input
                    type="text"
                    value={trocoPara}
                    onChange={(e) => handleTrocoChange(e.target.value)}
                    className="form-control"
                    placeholder={`Mínimo R$ ${calcularTotal().toFixed(2)}`}
                  />
                  {troco && (
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      Troco: R$ {troco.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                <button
                  onClick={() => setShowModalPagamento(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizarPedido}
                  className="btn btn-success"
                  disabled={!formaPagamento}
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumo Diário */}
      {showResumoDiario && resumoDiario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Resumo Diário - {resumoDiario.data}</h2>
              <button
                onClick={() => setShowResumoDiario(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  backgroundColor: '#e8f4fc', 
                  padding: '20px', 
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#3498db' }}>Total de Pedidos</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {resumoDiario.totalPedidos}
                    </div>
                    <div style={{ fontSize: '14px', color: '#3498db', marginTop: '10px' }}>Valor Total Vendido</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                      R$ {resumoDiario.totalVendas.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Grid de Formas de Pagamento */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    backgroundColor: '#d4edda', 
                    padding: '15px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#155724' }}>DINHEIRO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724' }}>
                      R$ {resumoDiario.totalDinheiro.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#cce5ff', 
                    padding: '15px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#004085' }}>PIX</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#004085' }}>
                      R$ {resumoDiario.totalPix.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    padding: '15px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#856404' }}>CARTÃO DÉBITO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#856404' }}>
                      R$ {resumoDiario.totalCartaoDebito.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f8d7da', 
                    padding: '15px', 
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#721c24' }}>CARTÃO CRÉDITO</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#721c24' }}>
                      R$ {resumoDiario.totalCartaoCredito.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Totais Finais */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '600' }}>Total de Troco Dado:</span>
                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      R$ {resumoDiario.totalTroco.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>Total em Caixa (Dinheiro):</span>
                    <span style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold' }}>
                      R$ {resumoDiario.totalEmCaixa.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                    *Dinheiro recebido ({resumoDiario.totalDinheiro.toFixed(2)}) - Troco dado ({resumoDiario.totalTroco.toFixed(2)})
                  </div>
                </div>

                {/* Lista de Pedidos do Dia */}
                <details>
                  <summary style={{ 
                    cursor: 'pointer', 
                    color: '#3498db', 
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    Ver Pedidos do Dia ({resumoDiario.totalPedidos})
                  </summary>
                  <div style={{ 
                    marginTop: '10px', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    {resumoDiario.pedidos.map((pedido, index) => (
                      <div key={pedido.id} style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>Pedido #{pedido.id}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {formatarData(pedido.created_at)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>R$ {pedido.valor_total.toFixed(2)}</div>
                            <div style={{ fontSize: '12px', color: '#3498db' }}>
                              {getFormaPagamentoText(pedido.forma_pagamento)}
                            </div>
                            {pedido.troco && (
                              <div style={{ fontSize: '11px', color: '#e74c3c' }}>
                                Troco: R$ {pedido.troco.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => setShowResumoDiario(false)}
                  className="btn btn-secondary"
                >
                  Fechar
                </button>
                <button
                  onClick={exportarResumoPDF}
                  className="btn btn-primary"
                >
                  Exportar Resumo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}