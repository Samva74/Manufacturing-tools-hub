// ============================================================
// CNC App - raccordement des boutons + à Supabase
// À coller juste avant </body>, après le bloc Supabase CNC existant.
// Ne modifie pas le design, les couleurs ni la disposition.
// ============================================================
let cncRemoteMachines = [];

function cncSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || ('item_' + Date.now());
}

function cncNumber(value, fallback) {
  const n = parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function cncApiUrl(table, query = '') {
  return `${CNC_SUPABASE_URL}/rest/v1/${table}${query}`;
}

async function cncApiGet(table, query = '?select=*') {
  const response = await fetch(cncApiUrl(table, query), {
    method: 'GET',
    headers: cncSbHeaders()
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

async function cncApiInsert(table, payload) {
  const response = await fetch(cncApiUrl(table), {
    method: 'POST',
    headers: cncSbHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

function cncAddOptionIfMissing(select, value, label) {
  if (![...select.options].some(o => o.value === value || o.text === label)) {
    select.add(new Option(label, value));
  }
}

function cncApplyMachine(row) {
  if (!row) return;
  if ($('nMax')) $('nMax').value = row.n_max ?? $('nMax').value;
  if ($('vfMax')) $('vfMax').value = row.vf_max ?? $('vfMax').value;
  if ($('margeN')) $('margeN').value = row.safety_n ?? $('margeN').value;
  if ($('margeVf')) $('margeVf').value = row.safety_vf ?? $('margeVf').value;
  calc();
}

function cncMergeMaterial(row) {
  if (!row || !row.code) return;
  const current = DATA[row.code] || {};
  DATA[row.code] = {
    name: {
      fr: row.name_fr || row.code,
      en: row.name_en || row.name_fr || row.code,
      pt: row.name_pt || row.name_fr || row.code
    },
    family: {
      fr: row.family_fr || 'Matière ajoutée',
      en: row.family_en || row.family_fr || 'Added material',
      pt: row.family_pt || row.family_fr || 'Material adicionado'
    },
    rem: {
      fr: row.remark_fr || 'Matière ajoutée via Supabase.',
      en: row.remark_en || row.remark_fr || 'Material added through Supabase.',
      pt: row.remark_pt || row.remark_fr || 'Material adicionado via Supabase.'
    },
    pMin: cncNumber(row.p_min, 0.3),
    pMax: cncNumber(row.p_max, 0.7),
    eMin: cncNumber(row.e_min, 0.2),
    eMax: cncNumber(row.e_max, 0.4),
    tools: current.tools || JSON.parse(JSON.stringify(DATA.pmma?.tools || DATA[Object.keys(DATA)[0]].tools))
  };
}

function cncMergeTool(row) {
  if (!row || !row.material_code || !row.tool_code) return;
  if (!DATA[row.material_code]) return;
  DATA[row.material_code].tools[row.tool_code] = {
    label: {
      fr: row.label_fr || row.tool_code,
      en: row.label_en || row.label_fr || row.tool_code,
      pt: row.label_pt || row.label_fr || row.tool_code
    },
    usage: {
      fr: row.usage_fr || 'Outil ajouté via Supabase.',
      en: row.usage_en || row.usage_fr || 'Tool added through Supabase.',
      pt: row.usage_pt || row.usage_fr || 'Ferramenta adicionada via Supabase.'
    },
    values: [
      cncNumber(row.vc_min, 150),
      cncNumber(row.vc_rec, 250),
      cncNumber(row.vc_max, 350),
      cncNumber(row.fz_min, 0.03),
      cncNumber(row.fz_rec, 0.06),
      cncNumber(row.fz_max, 0.10)
    ]
  };
}

async function loadCncEditableLibrary() {
  try {
    cncRemoteMachines = await cncApiGet('cnc_machines', '?select=*&order=name.asc');
    const machineSelect = $('machine');
    if (machineSelect) {
      cncRemoteMachines.forEach(m => cncAddOptionIfMissing(machineSelect, m.name, m.name));
    }
  } catch(e) {
    console.warn('cnc_machines non chargé', e);
  }

  try {
    const mats = await cncApiGet('cnc_materials', '?select=*&order=name_fr.asc');
    mats.forEach(cncMergeMaterial);
  } catch(e) {
    console.warn('cnc_materials non chargé', e);
  }

  try {
    const tools = await cncApiGet('cnc_tools', '?select=*&order=label_fr.asc');
    tools.forEach(cncMergeTool);
  } catch(e) {
    console.warn('cnc_tools non chargé', e);
  }

  try {
    const curMat = $('mat')?.value;
    const curTool = $('tool')?.value;
    fillMaterials(curMat, curTool, true);
  } catch(e) {
    console.warn('Rafraîchissement bibliothèque impossible', e);
  }
}

async function addCncMachine() {
  const currentName = $('machine')?.value || 'Nouvelle machine';
  const name = prompt('Nom de la machine', currentName);
  if (!name) return;
  const nMax = cncNumber(prompt('n max machine en tr/min', $('nMax')?.value || 24000), 24000);
  const vfMax = cncNumber(prompt('Vf max machine en mm/min', $('vfMax')?.value || 3000), 3000);
  const safetyN = cncNumber(prompt('Marge sécurité n', $('margeN')?.value || 0.95), 0.95);
  const safetyVf = cncNumber(prompt('Marge sécurité Vf', $('margeVf')?.value || 0.90), 0.90);

  try {
    const inserted = await cncApiInsert('cnc_machines', {
      name: name.trim(),
      n_max: nMax,
      vf_max: vfMax,
      safety_n: safetyN,
      safety_vf: safetyVf
    });
    const row = inserted[0];
    cncRemoteMachines.push(row);
    cncAddOptionIfMissing($('machine'), row.name, row.name);
    $('machine').value = row.name;
    cncApplyMachine(row);
    toast('Machine ajoutée + Supabase');
  } catch(e) {
    console.error('Ajout machine impossible', e);
    toast('Erreur ajout machine');
  }
}

async function addCncMaterial() {
  const nameFr = prompt('Nom matière FR', 'Nouvelle matière');
  if (!nameFr) return;
  const code = cncSlug(prompt('Code matière simple', cncSlug(nameFr)) || nameFr);
  const nameEn = prompt('Nom matière EN', nameFr) || nameFr;
  const namePt = prompt('Nom matière PT', nameFr) || nameFr;
  const familyFr = prompt('Famille matière', 'Matière ajoutée') || 'Matière ajoutée';
  const remarkFr = prompt('Remarque / vigilance', 'Matière ajoutée via Supabase.') || '';
  const pMin = cncNumber(prompt('Passe min en xD', '0.3'), 0.3);
  const pMax = cncNumber(prompt('Passe max en xD', '0.7'), 0.7);
  const eMin = cncNumber(prompt('Engagement min en xD', '0.2'), 0.2);
  const eMax = cncNumber(prompt('Engagement max en xD', '0.4'), 0.4);

  try {
    const inserted = await cncApiInsert('cnc_materials', {
      code,
      name_fr: nameFr.trim(),
      name_en: nameEn.trim(),
      name_pt: namePt.trim(),
      family_fr: familyFr.trim(),
      family_en: familyFr.trim(),
      family_pt: familyFr.trim(),
      remark_fr: remarkFr.trim(),
      remark_en: remarkFr.trim(),
      remark_pt: remarkFr.trim(),
      p_min: pMin,
      p_max: pMax,
      e_min: eMin,
      e_max: eMax
    });
    cncMergeMaterial(inserted[0]);
    fillMaterials(code, null, true);
    $('mat').value = code;
    fillTools();
    toast('Matière ajoutée + Supabase');
  } catch(e) {
    console.error('Ajout matière impossible', e);
    toast('Erreur ajout matière');
  }
}

async function addCncTool() {
  const materialCode = $('mat')?.value;
  if (!materialCode || !DATA[materialCode]) {
    toast('Choisir une matière');
    return;
  }
  const labelFr = prompt('Nom outil FR', 'Nouvel outil');
  if (!labelFr) return;
  const toolCode = cncSlug(prompt('Code outil simple', cncSlug(labelFr)) || labelFr);
  const labelEn = prompt('Nom outil EN', labelFr) || labelFr;
  const labelPt = prompt('Nom outil PT', labelFr) || labelFr;
  const usageFr = prompt('Usage / remarque outil', 'Outil ajouté via Supabase.') || '';
  const vcMin = cncNumber(prompt('Vc min m/min', '150'), 150);
  const vcRec = cncNumber(prompt('Vc recommandée m/min', '250'), 250);
  const vcMax = cncNumber(prompt('Vc max m/min', '350'), 350);
  const fzMin = cncNumber(prompt('Fz min mm/dent', '0.03'), 0.03);
  const fzRec = cncNumber(prompt('Fz recommandé mm/dent', '0.06'), 0.06);
  const fzMax = cncNumber(prompt('Fz max mm/dent', '0.10'), 0.10);

  try {
    const inserted = await cncApiInsert('cnc_tools', {
      material_code: materialCode,
      tool_code: toolCode,
      label_fr: labelFr.trim(),
      label_en: labelEn.trim(),
      label_pt: labelPt.trim(),
      usage_fr: usageFr.trim(),
      usage_en: usageFr.trim(),
      usage_pt: usageFr.trim(),
      vc_min: vcMin,
      vc_rec: vcRec,
      vc_max: vcMax,
      fz_min: fzMin,
      fz_rec: fzRec,
      fz_max: fzMax
    });
    cncMergeTool(inserted[0]);
    fillTools(toolCode);
    $('tool').value = toolCode;
    calc();
    toast('Outil ajouté + Supabase');
  } catch(e) {
    console.error('Ajout outil impossible', e);
    toast('Erreur ajout outil');
  }
}

function wireCncPlusButtons() {
  const buttons = [...document.querySelectorAll('.mini-plus')];
  if (buttons[0]) buttons[0].onclick = addCncMachine;
  if (buttons[1]) buttons[1].onclick = addCncMaterial;
  if (buttons[2]) buttons[2].onclick = addCncTool;

  const machineSelect = $('machine');
  if (machineSelect && !machineSelect.dataset.supabaseWired) {
    machineSelect.dataset.supabaseWired = '1';
    machineSelect.addEventListener('change', () => {
      const row = cncRemoteMachines.find(m => m.name === machineSelect.value);
      cncApplyMachine(row);
    });
  }
}

setTimeout(() => {
  wireCncPlusButtons();
  loadCncEditableLibrary();
}, 700);
