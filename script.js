const state = {
            pedidoAtual: null,
            itensPedido: [],
            pedidos: [],
            pedidosPendentes: [],
            formaPagamento: '',
            trocoPara: '',
            troco: null,
            pedidoPendenteSelecionado: null,
            formaPagamentoPendente: '',
            trocoParaPendente: '',
            trocoPendente: null,
            currentTab: 'todos'
        };

        const PEDIDOS_KEY = 'sistema_pedidos_pedidos';
        const PEDIDOS_PENDENTES_KEY = 'sistema_pedidos_pendentes';
        const PEDIDO_ATUAL_KEY = 'sistema_pedidos_pedido_atual';
        const ITENS_PEDIDO_KEY = 'sistema_pedidos_itens_pedido';
        const ULTIMO_ID_KEY = 'sistema_pedidos_ultimo_id';

        if (!localStorage.getItem(ULTIMO_ID_KEY)) {
            localStorage.setItem(ULTIMO_ID_KEY, '1000');
        }

        document.addEventListener('DOMContentLoaded', function() {
            carregarDados();
            renderizar();
            criarOpcoesPagamento();
            criarOpcoesPagamentoPendentes();
            atualizarContadores();
        });

        function formatarData(dataString) {
            const data = new Date(dataString);
            return data.toLocaleString('pt-BR');
        }

        function formatarDataSimples(dataString) {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR');
        }

        function getStatusText(status) {
            switch (status) {
                case 'pago': return 'Pago';
                case 'pendente': return 'Pendente';
                case 'atrasado': return 'Atrasado';
                default: return status;
            }
        }

        function getFormaPagamentoText(forma) {
            const formas = {
                'dinheiro': 'Dinheiro',
                'pix': 'PIX',
                'cartao_debito': 'Cartão Débito',
                'cartao_credito': 'Cartão Crédito'
            };
            return formas[forma] || 'Não informado';
        }

        function toast(mensagem, tipo = 'success') {
            const toastContainer = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${tipo}`;
            toast.textContent = mensagem;
            toastContainer.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            }, 3000);
        }

        function carregarDados() {
            try {
                const pedidosSalvos = localStorage.getItem(PEDIDOS_KEY);
                if (pedidosSalvos) {
                    state.pedidos = JSON.parse(pedidosSalvos);
                }
                
                const pendentesSalvos = localStorage.getItem(PEDIDOS_PENDENTES_KEY);
                if (pendentesSalvos) {
                    state.pedidosPendentes = JSON.parse(pendentesSalvos);
                }
                
                const pedidoAtualSalvo = localStorage.getItem(PEDIDO_ATUAL_KEY);
                if (pedidoAtualSalvo) {
                    state.pedidoAtual = JSON.parse(pedidoAtualSalvo);
                }
                
                const itensSalvos = localStorage.getItem(ITENS_PEDIDO_KEY);
                if (itensSalvos) {
                    state.itensPedido = JSON.parse(itensSalvos);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                toast('Erro ao carregar dados salvos', 'error');
            }
        }

        function salvarDados() {
            localStorage.setItem(PEDIDOS_KEY, JSON.stringify(state.pedidos));
            localStorage.setItem(PEDIDOS_PENDENTES_KEY, JSON.stringify(state.pedidosPendentes));
            
            if (state.pedidoAtual) {
                localStorage.setItem(PEDIDO_ATUAL_KEY, JSON.stringify(state.pedidoAtual));
            } else {
                localStorage.removeItem(PEDIDO_ATUAL_KEY);
            }
            
            if (state.itensPedido.length > 0) {
                localStorage.setItem(ITENS_PEDIDO_KEY, JSON.stringify(state.itensPedido));
            } else {
                localStorage.removeItem(ITENS_PEDIDO_KEY);
            }
        }

        function atualizarContadores() {
            const totalPendentes = state.pedidosPendentes.length;
            const totalPagos = state.pedidos.length;
            
            document.getElementById('badgeTodos').textContent = totalPendentes + totalPagos;
            document.getElementById('badgePendentes').textContent = totalPendentes;
            document.getElementById('badgePagos').textContent = totalPagos;
            
            document.getElementById('pendentesCount').textContent = `${totalPendentes} pendente${totalPendentes !== 1 ? 's' : ''}`;
            document.getElementById('pagosCount').textContent = `${totalPagos} pago${totalPagos !== 1 ? 's' : ''}`;
            document.getElementById('pedidosCount').textContent = `${totalPendentes + totalPagos} pedido${(totalPendentes + totalPagos) !== 1 ? 's' : ''}`;
        }

        function renderizar() {
            document.getElementById('panelTitle').textContent = 
                state.pedidoAtual ? 'Continuar Pedido' : 'Novo Pedido';
            
            const itemsPanel = document.getElementById('itemsPanel');
            const cancelButton = document.getElementById('cancelButton');
            
            if (state.itensPedido.length > 0) {
                itemsPanel.style.display = 'block';
                cancelButton.style.display = 'block';
                
                document.getElementById('orderTitle').textContent = 
                    `Itens do Pedido #${state.pedidoAtual?.id || ''}`;
                
                if (state.pedidoAtual?.created_at) {
                    document.getElementById('orderDate').textContent = 
                        `Iniciado em: ${formatarData(state.pedidoAtual.created_at)}`;
                }
                
                const itemsList = document.getElementById('itemsList');
                itemsList.innerHTML = '';
                
                let total = 0;
                state.itensPedido.forEach(item => {
                    const itemRow = document.createElement('div');
                    itemRow.className = 'item-row';
                    itemRow.innerHTML = `
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-value">R$ ${item.valor.toFixed(2)}</span>
                    `;
                    itemsList.appendChild(itemRow);
                    total += item.valor;
                });
                
                document.getElementById('orderTotal').textContent = `R$ ${total.toFixed(2)}`;
                document.getElementById('modalTotal').textContent = `R$ ${total.toFixed(2)}`;
                
                document.getElementById('trocoInput').placeholder = `Mínimo R$ ${total.toFixed(2)}`;
            } else {
                itemsPanel.style.display = 'none';
                cancelButton.style.display = 'none';
            }
            
            const pagosContainer = document.getElementById('pagosContainer');
            pagosContainer.innerHTML = '';
            
            if (state.pedidos.length === 0) {
                pagosContainer.innerHTML = `
                    <div class="loading">
                        <p>Nenhum pedido pago ainda</p>
                    </div>
                `;
            } else {
                state.pedidos.forEach(pedido => {
                    const pedidoCard = document.createElement('div');
                    pedidoCard.className = 'pedido-card';
                    
                    pedidoCard.innerHTML = `
                        <div class="pedido-header">
                            <div>
                                <div class="pedido-id">
                                    Pedido #${pedido.id} • ${formatarData(pedido.created_at)}
                                </div>
                                <div class="pedido-total">
                                    R$ ${pedido.valor_total.toFixed(2)}
                                </div>
                            </div>
                            <div class="status-badge status-${pedido.status}">
                                ${getStatusText(pedido.status)}
                            </div>
                        </div>
                        
                        <div class="pedido-info">
                            <p>
                                <strong>Pagamento:</strong> ${getFormaPagamentoText(pedido.forma_pagamento)}
                            </p>
                            
                            ${pedido.troco ? `
                            <p>
                                <strong>Troco:</strong> R$ ${pedido.troco.toFixed(2)}
                            </p>
                            ` : ''}
                            
                            ${pedido.troco_para ? `
                            <p>
                                <strong>Pago com:</strong> R$ ${pedido.troco_para.toFixed(2)}
                            </p>
                            ` : ''}
                            
                            ${pedido.itens ? `
                            <details style="margin-top: 10px;">
                                <summary style="cursor: pointer; color: #3498db;">
                                    Ver itens (${pedido.itens.length})
                                </summary>
                                <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                                    ${pedido.itens.map((item, index) => `
                                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                            <span>${item.descricao}</span>
                                            <span>R$ ${item.valor.toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                            ` : ''}
                        </div>
                    `;
                    
                    pagosContainer.appendChild(pedidoCard);
                });
            }
            
            const pendentesContainer = document.getElementById('pendentesContainer');
            pendentesContainer.innerHTML = '';
            
            if (state.pedidosPendentes.length === 0) {
                pendentesContainer.innerHTML = `
                    <div class="loading">
                        <p>Nenhum pedido pendente</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            Use "Pagar Depois" para adicionar pedidos aqui
                        </p>
                    </div>
                `;
            } else {
                state.pedidosPendentes.forEach(pedido => {
                    const pedidoCard = document.createElement('div');
                    pedidoCard.className = 'pedido-card';
                    
                    const criadoEm = new Date(pedido.created_at);
                    const agora = new Date();
                    const diferencaHoras = (agora - criadoEm) / (1000 * 60 * 60);
                    const estaAtrasado = diferencaHoras > 24;
                    
                    pedidoCard.innerHTML = `
                        <div class="pedido-header">
                            <div>
                                <div class="pedido-id">
                                    Pedido #${pedido.id} • ${formatarData(pedido.created_at)}
                                    ${estaAtrasado ? '<span style="color: #e74c3c; font-weight: bold;"> (ATRASADO)</span>' : ''}
                                </div>
                                <div class="pedido-total">
                                    R$ ${pedido.valor_total.toFixed(2)}
                                </div>
                            </div>
                            <div class="status-badge ${estaAtrasado ? 'status-atrasado' : 'status-pendente'}">
                                ${estaAtrasado ? 'Atrasado' : 'Pendente'}
                            </div>
                        </div>
                        
                        <div class="pedido-info">
                            <p>
                                <strong>Itens:</strong> ${pedido.itens ? pedido.itens.length : 0} item(s)
                            </p>
                            
                            ${pedido.itens ? `
                            <details style="margin-top: 10px;">
                                <summary style="cursor: pointer; color: #3498db;">
                                    Ver itens (${pedido.itens.length})
                                </summary>
                                <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                                    ${pedido.itens.map((item, index) => `
                                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                            <span>${item.descricao}</span>
                                            <span>R$ ${item.valor.toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                            ` : ''}
                            
                            <div class="action-buttons">
                                <button class="btn btn-success" onclick="abrirModalPagamentoPendente(${pedido.id})">
                                    Pagar Agora
                                </button>
                                <button class="btn btn-danger" onclick="cancelarPedidoPendente(${pedido.id})">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    `;
                    
                    pendentesContainer.appendChild(pedidoCard);
                });
            }
            
            const todosPedidos = [...state.pedidosPendentes, ...state.pedidos];
            todosPedidos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            const pedidosContainer = document.getElementById('pedidosContainer');
            pedidosContainer.innerHTML = '';
            
            if (todosPedidos.length === 0) {
                pedidosContainer.innerHTML = `
                    <div class="loading">
                        <p>Nenhum pedido registrado ainda</p>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">
                            Comece adicionando itens à esquerda
                        </p>
                    </div>
                `;
            } else {
                todosPedidos.forEach(pedido => {
                    const pedidoCard = document.createElement('div');
                    pedidoCard.className = 'pedido-card';
                    
                    const estaPendente = state.pedidosPendentes.some(p => p.id === pedido.id);
                    const criadoEm = new Date(pedido.created_at);
                    const agora = new Date();
                    const diferencaHoras = (agora - criadoEm) / (1000 * 60 * 60);
                    const estaAtrasado = estaPendente && diferencaHoras > 24;
                    
                    pedidoCard.innerHTML = `
                        <div class="pedido-header">
                            <div>
                                <div class="pedido-id">
                                    Pedido #${pedido.id} • ${formatarData(pedido.created_at)}
                                    ${estaAtrasado ? '<span style="color: #e74c3c; font-weight: bold;"> (ATRASADO)</span>' : ''}
                                </div>
                                <div class="pedido-total">
                                    R$ ${pedido.valor_total.toFixed(2)}
                                </div>
                            </div>
                            <div class="status-badge ${estaPendente ? (estaAtrasado ? 'status-atrasado' : 'status-pendente') : 'status-pago'}">
                                ${estaPendente ? (estaAtrasado ? 'Atrasado' : 'Pendente') : 'Pago'}
                            </div>
                        </div>
                        
                        <div class="pedido-info">
                            ${!estaPendente ? `
                            <p>
                                <strong>Pagamento:</strong> ${getFormaPagamentoText(pedido.forma_pagamento)}
                            </p>
                            
                            ${pedido.troco ? `
                            <p>
                                <strong>Troco:</strong> R$ ${pedido.troco.toFixed(2)}
                            </p>
                            ` : ''}
                            
                            ${pedido.troco_para ? `
                            <p>
                                <strong>Pago com:</strong> R$ ${pedido.troco_para.toFixed(2)}
                            </p>
                            ` : ''}
                            ` : `
                            <p>
                                <strong>Status:</strong> Aguardando pagamento
                            </p>
                            `}
                            
                            ${pedido.itens ? `
                            <details style="margin-top: 10px;">
                                <summary style="cursor: pointer; color: #3498db;">
                                    Ver itens (${pedido.itens.length})
                                </summary>
                                <div style="margin-top: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                                    ${pedido.itens.map((item, index) => `
                                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                                            <span>${item.descricao}</span>
                                            <span>R$ ${item.valor.toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                            ` : ''}
                            
                            ${estaPendente ? `
                            <div class="action-buttons">
                                <button class="btn btn-success" onclick="abrirModalPagamentoPendente(${pedido.id})">
                                    Pagar Agora
                                </button>
                                <button class="btn btn-danger" onclick="cancelarPedidoPendente(${pedido.id})">
                                    Cancelar
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    
                    pedidosContainer.appendChild(pedidoCard);
                });
            }
            
            atualizarContadores();
            salvarDados();
        }

        function mudarTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
            document.getElementById(`content${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
            
            state.currentTab = tab;
        }

        function criarOpcoesPagamento() {
            const formasPagamento = [
                { id: 'dinheiro', label: 'Dinheiro' },
                { id: 'pix', label: 'PIX' },
                { id: 'cartao_debito', label: 'Cartão de Débito' },
                { id: 'cartao_credito', label: 'Cartão de Crédito' }
            ];
            
            const paymentOptions = document.getElementById('paymentOptions');
            paymentOptions.innerHTML = '';
            
            formasPagamento.forEach(forma => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'payment-btn';
                button.textContent = forma.label;
                button.onclick = () => selecionarFormaPagamento(forma.id);
                paymentOptions.appendChild(button);
            });
        }

        function criarOpcoesPagamentoPendentes() {
            const formasPagamento = [
                { id: 'dinheiro', label: 'Dinheiro' },
                { id: 'pix', label: 'PIX' },
                { id: 'cartao_debito', label: 'Cartão de Débito' },
                { id: 'cartao_credito', label: 'Cartão Crédito' }
            ];
            
            const paymentOptions = document.getElementById('pendingPaymentOptions');
            paymentOptions.innerHTML = '';
            
            formasPagamento.forEach(forma => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'payment-btn';
                button.textContent = forma.label;
                button.onclick = () => selecionarFormaPagamentoPendente(forma.id);
                paymentOptions.appendChild(button);
            });
        }

        function gerarNovoId() {
            const ultimoId = parseInt(localStorage.getItem(ULTIMO_ID_KEY) || '1000');
            const novoId = ultimoId + 1;
            localStorage.setItem(ULTIMO_ID_KEY, novoId.toString());
            return novoId;
        }
        function calcularTotal() {
            return state.itensPedido.reduce((total, item) => total + item.valor, 0);
        }
        function adicionarItem() {
            const descricaoInput = document.getElementById('descricaoInput');
            const valorInput = document.getElementById('valorInput');
            
            const descricao = descricaoInput.value.trim();
            const valorStr = valorInput.value.trim();
            
            if (!descricao || !valorStr) {
                toast('Preencha valor e descrição!', 'error');
                return;
            }

            const valor = parseFloat(valorStr.replace(',', '.'));
            if (isNaN(valor) || valor <= 0) {
                toast('Valor inválido!', 'error');
                return;
            }

            if (!state.pedidoAtual) {
                state.pedidoAtual = {
                    id: gerarNovoId(),
                    valor_total: valor,
                    status: 'pendente',
                    created_at: new Date().toISOString()
                };
            } else {
                state.pedidoAtual.valor_total = 
                    parseFloat((state.pedidoAtual.valor_total + valor).toFixed(2));
            }

            const novoItem = {
                id: Date.now(),
                descricao: descricao,
                valor: valor,
                pedido_id: state.pedidoAtual.id
            };
            
            state.itensPedido.push(novoItem);
            
            descricaoInput.value = '';
            valorInput.value = '';
            descricaoInput.focus();
            toast('Item adicionado com sucesso!');
            
            renderizar();
        }

        function cancelarPedido() {
            if (state.pedidoAtual || state.itensPedido.length > 0) {
                if (confirm('Tem certeza que deseja cancelar o pedido atual?')) {
                    state.pedidoAtual = null;
                    state.itensPedido = [];
                    toast('Pedido cancelado!', 'error');
                    renderizar();
                }
            }
        }

        function cancelarPedidoPendente(id) {
            if (confirm('Tem certeza que deseja cancelar este pedido pendente?')) {
                state.pedidosPendentes = state.pedidosPendentes.filter(p => p.id !== id);
                toast('Pedido pendente cancelado!', 'error');
                renderizar();
            }
        }

        function abrirModalPagamento() {
            if (!state.pedidoAtual || state.itensPedido.length === 0) {
                toast('Adicione itens ao pedido primeiro!', 'error');
                return;
            }
            
            state.formaPagamento = '';
            state.trocoPara = '';
            state.troco = null;
            
            const paymentButtons = document.querySelectorAll('.payment-btn');
            paymentButtons.forEach(btn => btn.classList.remove('selected'));
            
            const trocoContainer = document.getElementById('trocoContainer');
            trocoContainer.style.display = 'none';
            
            const trocoResult = document.getElementById('trocoResult');
            trocoResult.style.display = 'none';
            
            const trocoInput = document.getElementById('trocoInput');
            trocoInput.value = '';
            
            const confirmButton = document.getElementById('confirmPaymentButton');
            confirmButton.disabled = true;
            
            document.getElementById('paymentModal').style.display = 'flex';
        }
        function fecharModalPagamento() {
            document.getElementById('paymentModal').style.display = 'none';
        }
        function selecionarFormaPagamento(forma) {
            state.formaPagamento = forma;
            const paymentButtons = document.querySelectorAll('.payment-btn');
            paymentButtons.forEach(btn => {
                btn.classList.remove('selected');
                if (btn.textContent === getFormaPagamentoText(forma)) {
                    btn.classList.add('selected');
                }
            });
            
            const trocoContainer = document.getElementById('trocoContainer');
            const confirmButton = document.getElementById('confirmPaymentButton');
            
            if (forma === 'dinheiro') {
                trocoContainer.style.display = 'block';
                confirmButton.disabled = false;
            } else {
                trocoContainer.style.display = 'none';
                confirmButton.disabled = false;
            }
        }

        function calcularTroco() {
            const trocoInput = document.getElementById('trocoInput');
            const trocoResult = document.getElementById('trocoResult');
            
            state.trocoPara = trocoInput.value;
            const valor = parseFloat(state.trocoPara.replace(',', '.'));
            
            if (!isNaN(valor) && valor > calcularTotal()) {
                state.troco = parseFloat((valor - calcularTotal()).toFixed(2));
                trocoResult.textContent = `Troco: R$ ${state.troco.toFixed(2)}`;
                trocoResult.style.display = 'block';
            } else {
                state.troco = null;
                trocoResult.style.display = 'none';
            }
        }

        function salvarParaPagarDepois() {
            if (!state.pedidoAtual || state.itensPedido.length === 0) {
                toast('Adicione itens ao pedido primeiro!', 'error');
                return;
            }

            const pedidoPendente = {
                ...state.pedidoAtual,
                itens: [...state.itensPedido]
            };
            state.pedidosPendentes.unshift(pedidoPendente);
            
            toast('Pedido salvo para pagamento posterior!', 'warning');
            
            state.pedidoAtual = null;
            state.itensPedido = [];
            
            renderizar();
            fecharModalPagamento();
            mudarTab('pendentes');
        }

        function finalizarPedido() {
            if (!state.formaPagamento) {
                toast('Selecione uma forma de pagamento!', 'error');
                return;
            }

            if (state.formaPagamento === 'dinheiro' && state.trocoPara) {
                const valorPago = parseFloat(state.trocoPara.replace(',', '.'));
                if (valorPago < calcularTotal()) {
                    toast('Valor para troco insuficiente!', 'error');
                    return;
                }
            }

            const pedidoFinalizado = {
                ...state.pedidoAtual,
                forma_pagamento: state.formaPagamento,
                troco_para: state.trocoPara ? parseFloat(state.trocoPara.replace(',', '.')) : null,
                troco: state.troco ? state.troco : null,
                status: 'pago',
                itens: [...state.itensPedido]
            };

            state.pedidos.unshift(pedidoFinalizado);

            toast('Pagamento realizado com sucesso!');

            state.pedidoAtual = null;
            state.itensPedido = [];
            state.formaPagamento = '';
            state.trocoPara = '';
            state.troco = null;

            fecharModalPagamento();
            renderizar();
        }

        function abrirModalPagamentoPendente(id) {
            const pedido = state.pedidosPendentes.find(p => p.id === id);
            if (!pedido) {
                toast('Pedido não encontrado!', 'error');
                return;
            }
            
            state.pedidoPendenteSelecionado = pedido;
            state.formaPagamentoPendente = '';
            state.trocoParaPendente = '';
            state.trocoPendente = null;
            
            document.getElementById('pendingOrderId').textContent = pedido.id;
            document.getElementById('pendingOrderDate').textContent = formatarData(pedido.created_at);
            document.getElementById('pendingOrderTotal').textContent = `R$ ${pedido.valor_total.toFixed(2)}`;
            
            const paymentButtons = document.querySelectorAll('#pendingPaymentOptions .payment-btn');
            paymentButtons.forEach(btn => btn.classList.remove('selected'));
            
            const trocoContainer = document.getElementById('pendingTrocoContainer');
            trocoContainer.style.display = 'none';
            
            const trocoResult = document.getElementById('pendingTrocoResult');
            trocoResult.style.display = 'none';
            
            const trocoInput = document.getElementById('pendingTrocoInput');
            trocoInput.value = '';
            trocoInput.placeholder = `Mínimo R$ ${pedido.valor_total.toFixed(2)}`;
            
            const confirmButton = document.getElementById('confirmPendingPaymentButton');
            confirmButton.disabled = true;
            
            document.getElementById('payPendingModal').style.display = 'flex';
        }

        function fecharModalPagamentoPendente() {
            document.getElementById('payPendingModal').style.display = 'none';
            state.pedidoPendenteSelecionado = null;
        }

        function selecionarFormaPagamentoPendente(forma) {
            state.formaPagamentoPendente = forma;
            
            const paymentButtons = document.querySelectorAll('#pendingPaymentOptions .payment-btn');
            paymentButtons.forEach(btn => {
                btn.classList.remove('selected');
                if (btn.textContent === getFormaPagamentoText(forma)) {
                    btn.classList.add('selected');
                }
            });
            
            const trocoContainer = document.getElementById('pendingTrocoContainer');
            const confirmButton = document.getElementById('confirmPendingPaymentButton');
            
            if (forma === 'dinheiro') {
                trocoContainer.style.display = 'block';
                confirmButton.disabled = false;
            } else {
                trocoContainer.style.display = 'none';
                confirmButton.disabled = false;
            }
        }

        function calcularTrocoPendente() {
            const trocoInput = document.getElementById('pendingTrocoInput');
            const trocoResult = document.getElementById('pendingTrocoResult');
            
            state.trocoParaPendente = trocoInput.value;
            const valor = parseFloat(state.trocoParaPendente.replace(',', '.'));
            const totalPedido = state.pedidoPendenteSelecionado.valor_total;
            
            if (!isNaN(valor) && valor > totalPedido) {
                state.trocoPendente = parseFloat((valor - totalPedido).toFixed(2));
                trocoResult.textContent = `Troco: R$ ${state.trocoPendente.toFixed(2)}`;
                trocoResult.style.display = 'block';
            } else {
                state.trocoPendente = null;
                trocoResult.style.display = 'none';
            }
        }

        function finalizarPagamentoPendente() {
            if (!state.formaPagamentoPendente) {
                toast('Selecione uma forma de pagamento!', 'error');
                return;
            }

            if (state.formaPagamentoPendente === 'dinheiro' && state.trocoParaPendente) {
                const valorPago = parseFloat(state.trocoParaPendente.replace(',', '.'));
                if (valorPago < state.pedidoPendenteSelecionado.valor_total) {
                    toast('Valor para troco insuficiente!', 'error');
                    return;
                }
            }

            const pedidoPago = {
                ...state.pedidoPendenteSelecionado,
                forma_pagamento: state.formaPagamentoPendente,
                troco_para: state.trocoParaPendente ? parseFloat(state.trocoParaPendente.replace(',', '.')) : null,
                troco: state.trocoPendente ? state.trocoPendente : null,
                status: 'pago',
                pago_em: new Date().toISOString()
            };

            state.pedidosPendentes = state.pedidosPendentes.filter(
                p => p.id !== state.pedidoPendenteSelecionado.id
            );
            state.pedidos.unshift(pedidoPago);
            toast('Pagamento do pedido pendente realizado com sucesso!');
            fecharModalPagamentoPendente();
            renderizar();
            
            mudarTab('pagos');
        }

        function limparHistorico() {
            if (confirm('Tem certeza que deseja limpar todo o histórico de pedidos? Isso inclui pendentes e pagos.')) {
                state.pedidos = [];
                state.pedidosPendentes = [];
                localStorage.removeItem(PEDIDOS_KEY);
                localStorage.removeItem(PEDIDOS_PENDENTES_KEY);
                toast('Histórico limpo com sucesso!');
                renderizar();
            }
        }

        function exportarDados() {
            try {
                const dados = {
                    pedidos: state.pedidos,
                    pedidos_pendentes: state.pedidosPendentes,
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
        }

        function importarDados(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dados = JSON.parse(e.target.result);
                    
                    let confirmMessage = 'Deseja importar os dados?';
                    if (dados.pedidos && Array.isArray(dados.pedidos)) {
                        confirmMessage += `\n- ${dados.pedidos.length} pedido(s) pago(s)`;
                    }
                    if (dados.pedidos_pendentes && Array.isArray(dados.pedidos_pendentes)) {
                        confirmMessage += `\n- ${dados.pedidos_pendentes.length} pedido(s) pendente(s)`;
                    }
                    
                    if (confirm(confirmMessage)) {
                        if (dados.pedidos && Array.isArray(dados.pedidos)) {
                            state.pedidos = dados.pedidos;
                        }
                        if (dados.pedidos_pendentes && Array.isArray(dados.pedidos_pendentes)) {
                            state.pedidosPendentes = dados.pedidos_pendentes;
                        }
                        
                        const total = (state.pedidos.length || 0) + (state.pedidosPendentes.length || 0);
                        toast(`Importados ${total} pedidos com sucesso!`);
                        renderizar();
                    }
                } catch (error) {
                    toast('Erro ao ler arquivo', 'error');
                }
            };
            reader.readAsText(file);
        }

        function calcularResumoDiario() {
            const hoje = new Date().toLocaleDateString('pt-BR');
            
            const pedidosHoje = state.pedidos.filter(pedido => {
                const dataPedido = new Date(pedido.created_at).toLocaleDateString('pt-BR');
                return dataPedido === hoje && pedido.status === 'pago';
            });

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

            const totalEmCaixa = totalDinheiro - totalTroco;

            state.resumoDiario = {
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
            };

            mostrarModalResumo();
        }

        function mostrarModalResumo() {
            const resumo = state.resumoDiario;
            const summaryContent = document.getElementById('summaryContent');
            const summaryTitle = document.getElementById('summaryTitle');
            
            summaryTitle.textContent = `Resumo Diário - ${resumo.data}`;
            
            summaryContent.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <div style="background-color: #e8f4fc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: #3498db;">Total de Pedidos</div>
                            <div style="font-size: 32px; font-weight: bold; color: #2c3e50;">
                                ${resumo.totalPedidos}
                            </div>
                            <div style="font-size: 14px; color: #3498db; margin-top: 10px;">Valor Total Vendido</div>
                            <div style="font-size: 28px; font-weight: bold; color: #27ae60;">
                                R$ ${resumo.totalVendas.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #155724;">DINHEIRO</div>
                            <div style="font-size: 18px; font-weight: bold; color: #155724;">
                                R$ ${resumo.totalDinheiro.toFixed(2)}
                            </div>
                        </div>
                        
                        <div style="background-color: #cce5ff; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #004085;">PIX</div>
                            <div style="font-size: 18px; font-weight: bold; color: #004085;">
                                R$ ${resumo.totalPix.toFixed(2)}
                            </div>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #856404;">CARTÃO DÉBITO</div>
                            <div style="font-size: 18px; font-weight: bold; color: #856404;">
                                R$ ${resumo.totalCartaoDebito.toFixed(2)}
                            </div>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #721c24;">CARTÃO CRÉDITO</div>
                            <div style="font-size: 18px; font-weight: bold; color: #721c24;">
                                R$ ${resumo.totalCartaoCredito.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600;">Total de Troco Dado:</span>
                            <span style="color: #e74c3c; font-weight: bold;">
                                R$ ${resumo.totalTroco.toFixed(2)}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; font-size: 16px;">Total em Caixa (Dinheiro):</span>
                            <span style="color: #27ae60; font-size: 20px; font-weight: bold;">
                                R$ ${resumo.totalEmCaixa.toFixed(2)}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 10px;">
                            *Dinheiro recebido (${resumo.totalDinheiro.toFixed(2)}) - Troco dado (${resumo.totalTroco.toFixed(2)})
                        </div>
                    </div>

                    <details>
                        <summary style="cursor: pointer; color: #3498db; font-weight: 600; margin-bottom: 10px;">
                            Ver Pedidos do Dia (${resumo.totalPedidos})
                        </summary>
                        <div style="margin-top: 10px; max-height: 200px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; padding: 10px;">
                            ${resumo.pedidos.map((pedido, index) => `
                                <div style="padding: 10px; border-bottom: 1px solid #eee; background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                                    <div style="display: flex; justify-content: space-between;">
                                        <div>
                                            <div style="font-weight: 600;">Pedido #${pedido.id}</div>
                                            <div style="font-size: 12px; color: #666;">
                                                ${formatarData(pedido.created_at)}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: bold;">R$ ${pedido.valor_total.toFixed(2)}</div>
                                            <div style="font-size: 12px; color: #3498db;">
                                                ${getFormaPagamentoText(pedido.forma_pagamento)}
                                            </div>
                                            ${pedido.troco ? `
                                            <div style="font-size: 11px; color: #e74c3c;">
                                                Troco: R$ ${pedido.troco.toFixed(2)}
                                            </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="fecharModalResumo()">
                        Fechar
                    </button>
                    <button class="btn btn-primary" onclick="exportarResumo()">
                        Exportar Resumo
                    </button>
                </div>
            `;
            
            document.getElementById('summaryModal').style.display = 'flex';
        }

        function fecharModalResumo() {
            document.getElementById('summaryModal').style.display = 'none';
        }

        function exportarResumo() {
            if (!state.resumoDiario) return;

            const resumo = state.resumoDiario;
            const resumoTexto = `
RESUMO DIÁRIO - ${resumo.data}
========================================

TOTAL DE PEDIDOS: ${resumo.totalPedidos}
VALOR TOTAL VENDIDO: R$ ${resumo.totalVendas.toFixed(2)}

FORMA DE PAGAMENTO:
- DINHEIRO: R$ ${resumo.totalDinheiro.toFixed(2)}
- PIX: R$ ${resumo.totalPix.toFixed(2)}
- CARTÃO DÉBITO: R$ ${resumo.totalCartaoDebito.toFixed(2)}
- CARTÃO CRÉDITO: R$ ${resumo.totalCartaoCredito.toFixed(2)}

TROCO TOTAL DADO: R$ ${resumo.totalTroco.toFixed(2)}
TOTAL EM CAIXA: R$ ${resumo.totalEmCaixa.toFixed(2)}

PEDIDOS DO DIA:
${resumo.pedidos.map((pedido, index) => `
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
            a.download = `resumo_diario_${resumo.data.replace(/\//g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast('Resumo exportado com sucesso!');
        }

        function handleEnterKey(event, callback) {
            if (event.key === 'Enter') {
                callback();
            }
        }

        document.querySelector('.file-input-wrapper button').addEventListener('click', function() {
            document.getElementById('importInput').click();
        });