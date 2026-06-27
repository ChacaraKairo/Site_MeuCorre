document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('[data-community-vehicle-form]');
  if (!form) return;

  const fieldsContainer = form.querySelector('[data-community-fields]');
  const steps = Array.from(form.querySelectorAll('[data-form-step]'));
  const nextButton = form.querySelector('[data-step-next]');
  const backButton = form.querySelector('[data-step-back]');
  const submitButton = form.querySelector('[data-submit-button]');
  const status = form.querySelector('[data-form-status]');
  const successPanel = form.querySelector('[data-success-panel]');
  const stepLabel = form.querySelector('[data-step-label]');
  const progressPercent = form.querySelector('[data-progress-percent]');
  const progressBar = form.querySelector('[data-progress-bar]');
  const storageKey = 'korre_comunidade_veiculo_rascunho';
  const queueKey = 'korre_sugestoes_veiculo_pendentes';
  let currentStep = 0;

  const PARAM_FIELDS = [
    ['estado_uf', 'Estado (UF)', 'text', 'Ex: SP'],
    ['valor_veiculo_fipe', 'Valor FIPE (R$)', 'decimal', 'Ex: 18500'],
    ['depreciacao_real_estimada', 'Depreciacao real estimada (%)', 'decimal', 'Ex: 12'],
    ['depreciacao_por_km', 'Depreciacao por km (R$)', 'decimal', 'Ex: 0,18'],
    ['ipva_anual', 'IPVA anual (R$)', 'decimal', 'Ex: 720'],
    ['licenciamento_detran_anual', 'Licenciamento DETRAN anual (R$)', 'decimal', 'Ex: 160'],
    ['taxa_vistoria_gnv_anual', 'Taxa vistoria GNV anual (R$)', 'decimal', 'Ex: 220'],
    ['seguro_comercial_anual', 'Seguro comercial anual (R$)', 'decimal', 'Ex: 1800'],
    ['rastreador_telemetria_mensal', 'Rastreador/telemetria mensal (R$)', 'decimal', 'Ex: 45'],
    ['rendimento_energia_unidade', 'Rendimento energia unidade', 'text', 'Ex: km/l, km/kWh ou km/m3'],
    ['preco_energia_unidade', 'Preco energia unidade (R$)', 'decimal', 'Ex: 5,79'],
    ['manutenção_imprevista_por_km', 'Manutencao imprevista por km (R$)', 'decimal', 'Ex: 0,06'],
    ['mao_obra_preventiva_por_km', 'Mao de obra preventiva por km (R$)', 'decimal', 'Ex: 0,04'],
    ['limpeza_higienizacao_por_km', 'Limpeza/higienizacao por km (R$)', 'decimal', 'Ex: 0,03'],
    ['fundo_depreciacao_bateria_por_km', 'Fundo depreciacao bateria por km (R$)', 'decimal', 'Ex: 0,10'],
  ];

  const VEHICLE_SUGGESTIONS = {
    moto: {
      HONDA: {
        'CG TITAN': ['160 CC', '150 CC', '125 CC'],
        'CG FAN': ['160 CC', '150 CC', '125 CC'],
        'CG START': ['160 CC', '150 CC'],
        'CB TWISTER': ['300F', '250 CC', '250 CC (CBX)'],
        'CB 300R': ['300 CC'],
        'CB 600F HORNET': ['600 CC'],
        XRE: ['300 CC', '190 CC'],
        'NXR BROS': ['160 CC', '150 CC', '125 CC'],
        BIZ: ['125 CC', '110i CC', '100 CC'],
        PCX: ['160 CC', '150 CC'],
        'NX 400 FALCON': ['400 CC'],
        ADV: ['150 CC'],
        POP: ['110i CC', '100 CC'],
      },
      YAMAHA: {
        FAZER: ['250 CC', '150 CC'],
        FACTOR: ['150 CC', '125 CC'],
        LANDER: ['250 CC'],
        TENERE: ['250 CC', '660 CC'],
        'XT 660R': ['660 CC'],
        CROSSER: ['150 CC'],
        NMAX: ['160 CC'],
        XMAX: ['250 CC'],
        MT: ['03', '07', '09'],
        R15: ['150 CC'],
        NEO: ['125 CC', '115 CC'],
      },
      SUZUKI: {
        YES: ['125 CC'],
        INTRUDER: ['125 CC', '250 CC'],
        'V-STROM': ['650 CC', '1000 CC'],
        BANDIT: ['650 CC', '1250 CC'],
        BURGMAN: ['125 CC', '400 CC'],
      },
      BAJAJ: {
        DOMINAR: ['400 CC', '250 CC', '200 CC', '160 CC'],
        PULSAR: ['200 CC', '160 CC', '150 CC'],
      },
      MOTTU: {
        SPORT: ['110 CC'],
        ELECTRIC: ['REVE CC'],
      },
      SHINERAY: {
        XY: ['50 CC'],
        SHI: ['175 CC'],
        WORK: ['125 CC'],
        JET: ['50 CC', '125 CC'],
      },
      VOLTZ: {
        EVS: ['3000 W'],
        EV1: ['1500 W'],
      },
    },
    carro: {
      CHEVROLET: {
        ONIX: ['1.0 TURBO', '1.0 ASPIRADO', '1.4 FLEX'],
        CELTA: ['1.0 VHC', '1.4 MPFI'],
        CORSA: ['1.0', '1.4', '1.8'],
        ASTRA: ['2.0'],
        PRISMA: ['1.0', '1.4'],
        CRUZE: ['1.4 TURBO', '1.8'],
        TRACKER: ['1.0 TURBO', '1.2 TURBO', '1.8', '2.0'],
        MONTANA: ['1.2 TURBO', '1.4', '1.8'],
        S10: ['2.8 DIESEL', '2.4 FLEX', '2.5 FLEX'],
        VECTRA: ['2.0', '2.4'],
      },
      FIAT: {
        UNO: ['1.0 FIRE', '1.0 EVO', '1.3'],
        PALIO: ['1.0', '1.4', '1.6', '1.8'],
        STRADA: ['1.3', '1.4', '1.8', '1.0 TURBO'],
        ARGO: ['1.0', '1.3', '1.8'],
        PULSE: ['1.0 TURBO', '1.3'],
        FASTBACK: ['1.3 TURBO', '1.0 TURBO'],
        TORO: ['1.3 TURBO', '1.8', '2.0 DIESEL'],
        SIENA: ['1.0', '1.4', '1.6'],
        PUNTO: ['1.4', '1.6', '1.8'],
        MOBI: ['1.0'],
      },
      VOLKSWAGEN: {
        GOL: ['1.0', '1.6', '1.8'],
        FOX: ['1.0', '1.6'],
        POLO: ['1.0 TSI', '1.0 ASPIRADO', '1.6', '2.0'],
        GOLF: ['1.4 TSI', '1.6', '2.0'],
        SAVEIRO: ['1.6'],
        JETTA: ['1.4 TSI', '2.0 TSI', '2.5'],
        VOYAGE: ['1.0', '1.6'],
        'T-CROSS': ['1.0 TSI', '1.4 TSI'],
        NIVUS: ['1.0 TSI'],
      },
      TOYOTA: {
        COROLLA: ['1.8', '2.0', '1.8 HIBRIDO'],
        ETIOS: ['1.3', '1.5'],
        YARIS: ['1.3', '1.5'],
        HILUX: ['2.8 DIESEL', '3.0 DIESEL', '2.7 FLEX'],
        'COROLLA CROSS': ['2.0', '1.8 HIBRIDO'],
      },
      HYUNDAI: {
        HB20: ['1.0 TURBO', '1.0 ASPIRADO', '1.6'],
        CRETA: ['1.0 TURBO', '1.6', '2.0'],
        TUCSON: ['1.6 TURBO', '2.0'],
        I30: ['1.8', '2.0'],
      },
      FORD: {
        FIESTA: ['1.0', '1.6'],
        KA: ['1.0', '1.5'],
        ECOSPORT: ['1.5', '1.6', '2.0'],
        RANGER: ['2.0 DIESEL', '2.2 DIESEL', '3.0 DIESEL', '3.2 DIESEL'],
      },
      RENAULT: {
        SANDERO: ['1.0', '1.6', '2.0'],
        LOGAN: ['1.0', '1.6'],
        DUSTER: ['1.3 TURBO', '1.6', '2.0'],
        KWID: ['1.0'],
        CLIO: ['1.0', '1.6'],
      },
      HONDA: {
        CIVIC: ['1.5 TURBO', '1.7', '1.8', '2.0', 'HIBRIDO'],
        FIT: ['1.4', '1.5'],
        CITY: ['1.5'],
        'HR-V': ['1.5 TURBO', '1.8'],
      },
      JEEP: {
        RENEGADE: ['1.3 TURBO', '1.8 FLEX', '2.0 DIESEL'],
        COMPASS: ['1.3 TURBO', '2.0 DIESEL'],
      },
      NISSAN: {
        KICKS: ['1.6'],
        VERSA: ['1.0', '1.6'],
        MARCH: ['1.0', '1.6'],
      },
      BYD: {
        DOLPHIN: ['MINI', '95 CV', 'PLUS'],
        'SONG PLUS': ['DM-I'],
        SEAL: ['AWD'],
        'YUAN PLUS': ['EV'],
      },
      GWM: {
        HAVAL: ['H6 HEV', 'H6 PHEV', 'H6 GT'],
        ORA: ['03'],
      },
    },
    van: {
      FIAT: {
        DUCATO: ['2.3 DIESEL', '2.8 DIESEL'],
        FIORINO: ['1.3', '1.4'],
        DOBLO: ['1.3', '1.4', '1.8'],
      },
      RENAULT: {
        MASTER: ['2.3 DIESEL', '2.5 DIESEL'],
        KANGOO: ['1.6'],
      },
      MERCEDES: {
        SPRINTER: ['311', '313', '415', '515'],
      },
      IVECO: {
        DAILY: ['35S14', '45S17', '55C17'],
      },
    },
    bicicleta: {
      CALOI: {
        MTB: ['ARO 29', 'ARO 26'],
        URBANA: ['700'],
        VULCAN: ['ARO 29'],
      },
      OGGI: {
        MTB: ['BIG WHEEL', 'HACKER'],
      },
      SENSE: {
        ONE: ['ARO 29'],
        FUN: ['ARO 29'],
      },
    },
    carro_eletrico: {
      BYD: {
        DOLPHIN: ['95 CV', 'MINI', 'PLUS'],
        SEAL: ['AWD', '313 CV'],
        'SONG PLUS': ['DM-I'],
        'YUAN PLUS': ['EV'],
      },
      GWM: {
        ORA: ['03'],
        HAVAL: ['H6 HEV', 'H6 PHEV', 'H6 GT'],
      },
      TESLA: {
        'MODEL 3': ['STANDARD RANGE', 'LONG RANGE', 'PERFORMANCE'],
        'MODEL Y': ['LONG RANGE', 'PERFORMANCE'],
      },
      VOLVO: {
        XC40: ['RECHARGE'],
        C40: ['RECHARGE'],
        EX30: ['CORE', 'PLUS', 'ULTRA'],
      },
      VOLTZ: {
        EVS: ['3000 W'],
        EV1: ['1500 W'],
      },
      SHINERAY: {
        'SHE S': ['2000 W'],
      },
      MOTTU: {
        ELECTRIC: ['REVE CC'],
      },
    },
  };

  fieldsContainer.innerHTML = PARAM_FIELDS.map(function (field) {
    const name = field[0];
    const label = field[1];
    const kind = field[2];
    const placeholder = field[3];
    const type = kind === 'text' ? 'text' : 'number';
    const inputmode = kind === 'integer' ? 'numeric' : kind === 'decimal' ? 'decimal' : 'text';
    const step = kind === 'integer' ? 'step="1" min="0"' : kind === 'decimal' ? 'step="0.01" min="0"' : '';

    return [
      '<label>',
      label,
      ' <span>(opcional)</span>',
      '<input name="',
      name,
      '" type="',
      type,
      '" inputmode="',
      inputmode,
      '" ',
      step,
      ' placeholder="',
      placeholder,
      '" autocomplete="off" />',
      '</label>',
    ].join('');
  }).join('');

  function setStatus(message, type) {
    status.textContent = message;
    status.dataset.status = type || '';
  }

  function toNumberOrNull(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }

    const raw = String(value).trim();
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function titleSuggestion(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\b([a-z])/g, function (match) {
        return match.toUpperCase();
      })
      .replace(/\bCc\b/g, 'CC')
      .replace(/\bCv\b/g, 'CV')
      .replace(/\bTsI\b/g, 'TSI')
      .replace(/\bDmi\b/g, 'DM-I')
      .replace(/\bEv\b/g, 'EV')
      .replace(/\bHr-V\b/g, 'HR-V')
      .replace(/\bT-Cross\b/g, 'T-Cross');
  }

  function unique(values) {
    const seen = new Set();

    return values.filter(function (value) {
      const key = normalizeText(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function currentVehicleData() {
    const type = getFieldValue('tipo') || 'moto';
    return VEHICLE_SUGGESTIONS[type] || VEHICLE_SUGGESTIONS.moto;
  }

  function findKey(object, query) {
    const normalized = normalizeText(query);
    return Object.keys(object || {}).find(function (key) {
      return normalizeText(key) === normalized;
    });
  }

  function flattenModels(typeData, brandKey) {
    const brands = brandKey && typeData[brandKey] ? [brandKey] : Object.keys(typeData);
    return unique(brands.flatMap(function (brand) {
      return Object.keys(typeData[brand] || {});
    }));
  }

  function flattenMotors(typeData, brandKey, modelKey) {
    const brands = brandKey && typeData[brandKey] ? [brandKey] : Object.keys(typeData);
    const values = [];

    brands.forEach(function (brand) {
      const models = typeData[brand] || {};
      const modelNames = modelKey && models[modelKey] ? [modelKey] : Object.keys(models);

      modelNames.forEach(function (model) {
        values.push.apply(values, models[model] || []);
      });
    });

    return unique(values);
  }

  function suggestionsForField(name) {
    const typeData = currentVehicleData();
    const brandKey = findKey(typeData, getFieldValue('marca'));
    const models = brandKey ? typeData[brandKey] : {};
    const modelKey = findKey(models, getFieldValue('modelo'));

    if (name === 'marca') {
      return Object.keys(typeData).map(titleSuggestion);
    }

    if (name === 'modelo') {
      return flattenModels(typeData, brandKey).map(titleSuggestion);
    }

    if (name === 'motor') {
      return flattenMotors(typeData, brandKey, modelKey).map(titleSuggestion);
    }

    return [];
  }

  function filterSuggestions(name, value) {
    const normalized = normalizeText(value);
    const source = suggestionsForField(name);

    if (!normalized) {
      return source.slice(0, 7);
    }

    return source
      .filter(function (item) {
        return normalizeText(item).includes(normalized);
      })
      .sort(function (a, b) {
        const aStarts = normalizeText(a).startsWith(normalized) ? 0 : 1;
        const bStarts = normalizeText(b).startsWith(normalized) ? 0 : 1;
        return aStarts - bStarts || a.localeCompare(b);
      })
      .slice(0, 7);
  }

  function setupSmartAutocomplete() {
    ['marca', 'modelo', 'motor'].forEach(function (name) {
      const input = getField(name);
      if (!input || input.dataset.smartSuggestReady) return;

      const wrapper = document.createElement('div');
      const ghost = document.createElement('div');
      const action = document.createElement('button');
      const panel = document.createElement('div');
      const label = input.closest('label');

      wrapper.className = 'smart-suggest';
      ghost.className = 'smart-suggest-ghost';
      action.className = 'smart-suggest-action';
      action.type = 'button';
      action.textContent = 'Aut.';
      action.hidden = true;
      panel.className = 'smart-suggest-panel';
      panel.id = name + '-suggestions';
      panel.setAttribute('role', 'listbox');
      panel.hidden = true;

      input.dataset.smartSuggestReady = 'true';
      input.autocomplete = 'off';
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', panel.id);

      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(ghost);
      wrapper.appendChild(input);
      wrapper.appendChild(action);
      wrapper.appendChild(panel);

      if (label) {
        label.classList.add('smart-suggest-label');
      }

      function applySuggestion(value) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        hidePanel();
        input.focus();
      }

      function hidePanel() {
        panel.hidden = true;
        action.hidden = true;
        ghost.textContent = '';
        input.setAttribute('aria-expanded', 'false');
      }

      function renderPanel() {
        if (document.activeElement !== input) {
          hidePanel();
          return;
        }

        const value = input.value;
        const matches = filterSuggestions(name, value);
        const normalized = normalizeText(value);
        const firstStartsWith = matches.find(function (item) {
          return normalized && normalizeText(item).startsWith(normalized);
        });

        ghost.textContent = firstStartsWith ? value + firstStartsWith.slice(value.length) : '';
        action.hidden = !firstStartsWith || normalizeText(firstStartsWith) === normalized;
        action.dataset.value = firstStartsWith || '';

        if (!matches.length) {
          panel.hidden = true;
          input.setAttribute('aria-expanded', 'false');
          return;
        }

        panel.innerHTML = matches.map(function (item, index) {
          return [
            '<button type="button" role="option" data-suggest-value="',
            item.replace(/"/g, '&quot;'),
            '"',
            index === 0 ? ' class="is-highlighted"' : '',
            '>',
            '<span>',
            item,
            '</span>',
            '<small>Selecionar</small>',
            '</button>',
          ].join('');
        }).join('');

        panel.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      }

      input.addEventListener('input', renderPanel);
      input.addEventListener('focus', renderPanel);
      input.addEventListener('keydown', function (event) {
        const firstOption = panel.querySelector('[data-suggest-value]');

        if ((event.key === 'ArrowRight' || event.key === 'Tab') && !action.hidden && action.dataset.value) {
          event.preventDefault();
          applySuggestion(action.dataset.value);
          return;
        }

        if (event.key === 'Enter' && firstOption && !panel.hidden) {
          event.preventDefault();
          applySuggestion(firstOption.dataset.suggestValue);
          return;
        }

        if (event.key === 'Escape') {
          hidePanel();
        }
      });

      action.addEventListener('click', function () {
        if (action.dataset.value) {
          applySuggestion(action.dataset.value);
        }
      });

      panel.addEventListener('click', function (event) {
        const option = event.target.closest('[data-suggest-value]');
        if (option) {
          applySuggestion(option.dataset.suggestValue);
        }
      });

      document.addEventListener('click', function (event) {
        if (!wrapper.contains(event.target)) {
          hidePanel();
        }
      });
    });
  }

  function getField(name) {
    return form.elements[name];
  }

  function getFieldValue(name) {
    const field = getField(name);
    if (!field) return '';
    if (field.type === 'checkbox') return field.checked ? 'on' : '';
    return String(field.value || '').trim();
  }

  function setFieldState(name, message) {
    const field = getField(name);
    const feedback = form.querySelector('[data-field-error="' + name + '"]');

    if (field) {
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    if (feedback) {
      feedback.textContent = message || '';
      feedback.dataset.status = message ? 'error' : getFieldValue(name) ? 'success' : '';
    }
  }

  function validateField(name, silent) {
    let message = '';
    const value = getFieldValue(name);
    const field = getField(name);

    if (['tipo', 'marca', 'modelo'].includes(name) && !value) {
      message = 'Preencha este campo para continuar.';
    }

    if (name === 'consumo_medio') {
      const consumo = toNumberOrNull(value);
      if (!consumo || consumo <= 0) {
        message = 'Informe um consumo maior que zero. Exemplo: 31,5.';
      }
    }

    if (name === 'ano' && value) {
      const ano = Number(value);
      if (!Number.isInteger(ano) || ano < 1950 || ano > 2100) {
        message = 'Use um ano entre 1950 e 2100.';
      }
    }

    if (name === 'contribuidor_email' && value && field && !field.checkValidity()) {
      message = 'Digite um e-mail valido, como nome@email.com.';
    }

    if (name === 'observacoes' && value.length < 10) {
      message = 'Escreva pelo menos 10 caracteres sobre a origem dos dados.';
    }

    if (name === 'lgpd_consent' && !value) {
      message = 'Confirme o uso dos dados para enviar a contribuicao.';
    }

    if (!silent) {
      setFieldState(name, message);
    }

    return !message;
  }

  function validateStep(index, silent) {
    const requiredByStep = [
      ['tipo', 'marca', 'modelo', 'ano', 'consumo_medio'],
      [],
      [],
      ['contribuidor_email', 'observacoes', 'lgpd_consent'],
    ];

    return requiredByStep[index].every(function (name) {
      return validateField(name, silent);
    });
  }

  function updateSubmitState() {
    if (!submitButton) return;
    submitButton.disabled = !validateStep(3, true);
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));

    steps.forEach(function (step, stepIndex) {
      const isActive = stepIndex === currentStep;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });

    const progress = Math.round(((currentStep + 1) / steps.length) * 100);
    stepLabel.textContent = 'Etapa ' + (currentStep + 1) + ' de ' + steps.length;
    progressPercent.textContent = progress + '%';
    progressBar.style.width = progress + '%';
    backButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    updateSubmitState();
    setStatus('', '');
  }

  function saveDraft() {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      if (key !== 'website') {
        data[key] = value;
      }
    });

    data.lgpd_consent = getFieldValue('lgpd_consent');
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function restoreDraft() {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

    Object.keys(saved).forEach(function (name) {
      const field = getField(name);
      if (!field) return;

      if (field.type === 'checkbox') {
        field.checked = saved[name] === 'on';
      } else {
        field.value = saved[name];
      }
    });
  }

  function buildPayload() {
    const formData = new FormData(form);
    const raw = Object.fromEntries(formData.entries());
    const parametros = {};

    PARAM_FIELDS.forEach(function (field) {
      const name = field[0];
      const kind = field[2];
      parametros[name] = kind === 'text' ? String(raw[name] || '').trim() || null : toNumberOrNull(raw[name]);
    });

    return {
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
      lgpd_consent: getFieldValue('lgpd_consent') === 'on',
      parametros_financeiros: parametros,
      parâmetros_financeiros: parametros,
      website: raw.website,
    };
  }

  form.addEventListener('input', function (event) {
    if (event.target && event.target.name) {
      validateField(event.target.name, false);
      updateSubmitState();
      saveDraft();
    }
  });

  form.addEventListener('change', function (event) {
    if (event.target && event.target.name) {
      validateField(event.target.name, false);
      updateSubmitState();
      saveDraft();

    }
  });

  nextButton.addEventListener('click', function () {
    if (!validateStep(currentStep, false)) {
      setStatus('Revise os campos destacados antes de continuar.', 'error');
      const firstInvalid = steps[currentStep].querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    showStep(currentStep + 1);
  });

  backButton.addEventListener('click', function () {
    showStep(currentStep - 1);
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!validateStep(currentStep, false)) {
      setStatus('Revise os campos destacados antes de enviar.', 'error');
      const firstInvalid = steps[currentStep].querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const payload = buildPayload();

    submitButton.disabled = true;
    setStatus('Enviando sugestao...', 'loading');

    try {
      const response = await fetch('/api/sugestao-veiculo', {
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
        throw new Error(data.error || 'Falha ao enviar sugestao.');
      }

      form.reset();
      localStorage.removeItem(storageKey);
      setStatus('', '');
      successPanel.hidden = false;
      successPanel.focus();
      showStep(0);
    } catch (error) {
      const pendentes = JSON.parse(localStorage.getItem(queueKey) || '[]');
      pendentes.push(payload);
      localStorage.setItem(queueKey, JSON.stringify(pendentes));

      setStatus(
        'API indisponivel agora. Sua sugestao foi salva no navegador para nao perder os dados.',
        'error',
      );
      submitButton.disabled = false;
    }
  });

  setupSmartAutocomplete();
  restoreDraft();
  showStep(0);
});
