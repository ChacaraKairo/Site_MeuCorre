document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('[data-community-vehicle-form]');
  if (!form) return;

  const fieldsContainer = form.querySelector('[data-community-fields]');
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-form-status]');

  const PARAM_FIELDS = [
    ['estado_uf', 'Estado (UF)'],
    ['tipo_aquisicao', 'Tipo de aquisicao'],
    ['valor_veiculo_fipe', 'Valor FIPE (R$)'],
    ['depreciacao_real_estimada', 'Depreciacao real estimada (%)'],
    ['depreciacao_por_km', 'Depreciacao por km (R$)'],
    ['custo_oportunidade_selic', 'Custo oportunidade SELIC (R$)'],
    ['juros_financiamento_mensal', 'Juros financiamento mensal (R$)'],
    ['diaria_aluguel', 'Diaria aluguel (R$)'],
    ['caucao_aluguel_mensalizado', 'Caucao aluguel mensalizado (R$)'],
    ['taxa_administracao_consorcio', 'Taxa administracao consorcio (R$)'],
    ['custo_reparacao_emprestimo', 'Custo reparacao emprestimo (R$)'],
    ['ipva_anual', 'IPVA anual (R$)'],
    ['licenciamento_detran_anual', 'Licenciamento DETRAN anual (R$)'],
    ['imposto_mei_mensal', 'Imposto MEI mensal (R$)'],
    ['imposto_renda_mensal', 'Imposto de renda mensal (R$)'],
    ['taxa_vistoria_gnv_anual', 'Taxa vistoria GNV anual (R$)'],
    ['taxas_alvaras_municipais_anual', 'Taxas/alvaras municipais anual (R$)'],
    ['seguro_comercial_anual', 'Seguro comercial anual (R$)'],
    ['rastreador_telemetria_mensal', 'Rastreador/telemetria mensal (R$)'],
    ['plano_dados_mensal', 'Plano de dados mensal (R$)'],
    ['rendimento_energia_unidade', 'Rendimento energia unidade'],
    ['preco_energia_unidade', 'Preco energia unidade (R$)'],
    ['manutenção_imprevista_mensal', 'Manutencao imprevista mensal (R$)'],
    ['manutenção_imprevista_por_km', 'Manutencao imprevista por km (R$)'],
    ['mao_obra_preventiva_por_km', 'Mao de obra preventiva por km (R$)'],
    ['limpeza_higienizacao_mensal', 'Limpeza/higienizacao mensal (R$)'],
    ['limpeza_higienizacao_por_km', 'Limpeza/higienizacao por km (R$)'],
    ['alimentacao_diaria', 'Alimentacao diaria (R$)'],
    ['consumo_apoio_diario', 'Consumo apoio diario (R$)'],
    ['plano_saude_mensal', 'Plano saude mensal (R$)'],
    ['fundo_emergencia_percentual', 'Fundo emergencia (%)'],
    ['provisao_ferias_mensal', 'Provisao ferias mensal (R$)'],
    ['provisao_decimo_terceiro_mensal', 'Provisao 13o mensal (R$)'],
    ['salario_liquido_mensal_desejado', 'Salario liquido mensal desejado (R$)'],
    ['valor_smartphone', 'Valor smartphone (R$)'],
    ['vida_util_smartphone_meses', 'Vida util smartphone (meses)'],
    ['custo_powerbanks_cabos_mensal', 'Powerbanks/cabos mensal (R$)'],
    ['custo_suportes_capas_mensal', 'Suportes/capas mensal (R$)'],
    ['custo_bag_mochila_mensal', 'Bag/mochila mensal (R$)'],
    ['custo_vestuario_protecao_mensal', 'Vestuario/protecao mensal (R$)'],
    ['percentual_dead_miles', 'Percentual dead miles (%)'],
    ['tempo_espera_medio_minutos', 'Tempo espera medio (min)'],
    ['taxas_saque_antecipacao_mensal', 'Taxas saque/antecipacao mensal (R$)'],
    ['provisao_multas_mensal', 'Provisao multas mensal (R$)'],
    ['dias_trabalhados_semana', 'Dias trabalhados semana'],
    ['horas_por_dia', 'Horas por dia'],
    ['km_por_dia', 'KM por dia'],
    ['fundo_depreciacao_bateria_por_km', 'Fundo depreciacao bateria por km (R$)'],
    ['km_estimado_mes', 'KM estimado por mes'],
  ];

  fieldsContainer.innerHTML = PARAM_FIELDS.map(function (field) {
    const name = field[0];
    const label = field[1];
    const isText = name === 'estado_uf' || name === 'tipo_aquisicao';
    const type = isText ? 'text' : 'number';
    const step = isText ? '' : 'step="0.01" min="0"';
    return '<label>' + label + '<input name="' + name + '" type="' + type + '" ' + step + ' /></label>';
  }).join('');

  function setStatus(message, type) {
    status.textContent = message;
    status.dataset.status = type || '';
  }

  function toNumberOrNull(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }
    const num = Number(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : null;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const raw = Object.fromEntries(formData.entries());

    const parâmetros = {};
    PARAM_FIELDS.forEach(function (field) {
      const name = field[0];
      if (name === 'estado_uf' || name === 'tipo_aquisicao') {
        parâmetros[name] = String(raw[name] || '').trim() || null;
      } else {
        parâmetros[name] = toNumberOrNull(raw[name]);
      }
    });

    const payload = {
      tipo: String(raw.tipo || '').trim(),
      marca: String(raw.marca || '').trim(),
      modelo: String(raw.modelo || '').trim(),
      motor: String(raw.motor || '').trim(),
      ano: toNumberOrNull(raw.ano),
      consumo_medio: toNumberOrNull(raw.consumo_medio),
      valor_oleo_filtros: toNumberOrNull(raw.valor_oleo_filtros),
      intervalo_oleo_filtros_km: toNumberOrNull(raw.intervalo_oleo_filtros_km),
      valor_jogo_pneus: toNumberOrNull(raw.valor_jogo_pneus),
      durabilidade_pneus_km: toNumberOrNull(raw.durabilidade_pneus_km),
      valor_manutenção_freios: toNumberOrNull(raw.valor_manutenção_freios),
      intervalo_freios_km: toNumberOrNull(raw.intervalo_freios_km),
      valor_kit_transmissao: toNumberOrNull(raw.valor_kit_transmissao),
      durabilidade_transmissao_km: toNumberOrNull(raw.durabilidade_transmissao_km),
      observacoes: String(raw.observacoes || '').trim(),
      contribuidor_nome: String(raw.contribuidor_nome || '').trim(),
      contribuidor_email: String(raw.contribuidor_email || '').trim(),
      parâmetros_financeiros: parâmetros,
      website: raw.website,
    };

    if (!payload.tipo || !payload.marca || !payload.modelo) {
      setStatus('Preencha tipo, marca e modelo.', 'error');
      return;
    }

    if (!payload.consumo_medio || payload.consumo_medio <= 0) {
      setStatus('Informe o consumo medio maior que zero.', 'error');
      return;
    }

    if (payload.observacoes.length < 10) {
      setStatus('Inclua observacoes com pelo menos 10 caracteres.', 'error');
      return;
    }

    submitButton.disabled = true;
    setStatus('Enviando...', 'loading');

    try {
      const response = await fetch('/api/sugestão-veiculo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar sugestão.');
      }

      form.reset();
      setStatus('Sugestao enviada com sucesso. Obrigado por fortalecer a base do KORRE.', 'success');
    } catch (error) {
      const queueKey = 'korre_sugestões_veiculo_pendentes';
      const pendentes = JSON.parse(localStorage.getItem(queueKey) || '[]');
      pendentes.push(payload);
      localStorage.setItem(queueKey, JSON.stringify(pendentes));

      setStatus(
        'API indisponivel agora. Sua sugestão foi salva no navegador para não perder os dados.',
        'error',
      );
    } finally {
      submitButton.disabled = false;
    }
  });
});
