import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Copy, Plus, Trash2, Save, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../../../components/Toast';

interface GoogleSheetsSettingsProps {
    studioId: string;
}

export const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({ studioId }) => {
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
    const [copied, setCopied] = useState(false);

    // INPUT (Ingresso) State
    const [inputEnabled, setInputEnabled] = useState(false);
    const [inputSecret, setInputSecret] = useState('');
    const [inputMapping, setInputMapping] = useState<{ sheet: string, db: string }[]>([]);

    // OUTPUT (Master) State
    const [outputEnabled, setOutputEnabled] = useState(false);
    const [outputScriptUrl, setOutputScriptUrl] = useState('');
    const [outputMapping, setOutputMapping] = useState<{ sheet: string, db: string }[]>([]);

    const AVAILABLE_COLUMNS = [
        { label: 'Nome', value: 'first_name' },
        { label: 'Cognome', value: 'last_name' },
        { label: 'Nome Completo', value: 'full_name' },
        { label: 'Email', value: 'email' },
        { label: 'Telefono', value: 'phone' },
        { label: 'Città', value: 'city' },
        { label: 'Instagram', value: 'instagram_username' },
        { label: 'Codice Fiscale', value: 'fiscal_code' },
        { label: 'Data di Nascita', value: 'birth_date' },
        { label: 'Generi Preferiti', value: 'preferred_styles' },
        { label: 'Consenso WhatsApp', value: 'whatsapp_broadcast_opt_in' },
        { label: 'Note', value: 'notes' },
        { label: 'Data Creazione', value: 'created_at' }
    ];

    useEffect(() => {
        loadConfig();
    }, [studioId]);

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('studios')
                .select('google_sheets_config')
                .eq('id', studioId)
                .single();

            if (error) throw error;

            const config = data?.google_sheets_config;

            // Handle Structure (Legacy vs New)
            // If nested 'input' exists, use it. Else fall back to root props for input.
            if (config?.input) {
                setInputEnabled(config.input.enabled || false);
                setInputSecret(config.input.secret || '');
                if (config.input.mapping) {
                    setInputMapping(Object.entries(config.input.mapping).map(([sheet, db]) => ({ sheet, db: db as string })));
                }
            } else if (config?.auto_sync_enabled !== undefined) {
                // Legacy Fallback
                setInputEnabled(config.auto_sync_enabled);
                setInputSecret(config.webhook_secret || '');
                if (config.mapping) {
                    setInputMapping(Object.entries(config.mapping).map(([sheet, db]) => ({ sheet, db: db as string })));
                }
            } else {
                // Defaults
                setInputMapping([
                    { sheet: 'Nome', db: 'first_name' },
                    { sheet: 'Cognome', db: 'last_name' },
                    { sheet: 'Email', db: 'email' },
                    { sheet: 'Telefono', db: 'phone' }
                ]);
            }

            // Output Config
            if (config?.output) {
                setOutputEnabled(config.output.enabled || false);
                setOutputScriptUrl(config.output.script_url || '');
                if (config.output.mapping) {
                    setOutputMapping(Object.entries(config.output.mapping).map(([db, sheet]) => ({ sheet: sheet as string, db })));
                }
            } else {
                // Default Output Mapping (DB -> Sheet)
                setOutputMapping([
                    { db: 'full_name', sheet: 'Nome Completo' },
                    { db: 'email', sheet: 'Email' },
                    { db: 'phone', sheet: 'Telefono' },
                    { db: 'created_at', sheet: 'Data Creazione' }
                ]);
            }

        } catch (error) {
            console.error('Error loading config:', error);
            toastError('Errore nel caricamento della configurazione.');
        } finally {
            setLoading(false);
        }
    };

    const generateSecret = () => {
        const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        setInputSecret(newSecret);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Helper to array -> obj
            const toObj = (arr: { sheet: string, db: string }[], keyIsSheet: boolean) => arr.reduce((acc, curr) => {
                if (curr.sheet && curr.db) {
                    if (keyIsSheet) acc[curr.sheet] = curr.db;
                    else acc[curr.db] = curr.sheet;
                }
                return acc;
            }, {} as Record<string, string>);

            // Ensure secret exists if input enabled
            let finalSecret = inputSecret;
            if (inputEnabled && !finalSecret) {
                finalSecret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                setInputSecret(finalSecret);
            }

            const newConfig = {
                input: {
                    enabled: inputEnabled,
                    secret: finalSecret,
                    mapping: toObj(inputMapping, true) // Key: Sheet Header
                },
                output: {
                    enabled: outputEnabled,
                    script_url: outputScriptUrl,
                    mapping: toObj(outputMapping, false) // Key: DB Column
                }
            };

            const { error } = await supabase
                .from('studios')
                .update({ google_sheets_config: newConfig })
                .eq('id', studioId);

            if (error) throw error;
            success('Configurazione salvata con successo!');
        } catch (error) {
            console.error("Error saving:", error);
            toastError('Errore durante il salvataggio.');
        } finally {
            setSaving(false);
        }
    };

    // Mapping Helpers
    const updateMapping = (
        setter: React.Dispatch<React.SetStateAction<{ sheet: string, db: string }[]>>,
        list: { sheet: string, db: string }[],
        index: number,
        field: 'sheet' | 'db',
        value: string
    ) => {
        const copy = [...list];
        copy[index][field] = value;
        setter(copy);
    };

    const addRow = (setter: React.Dispatch<React.SetStateAction<{ sheet: string, db: string }[]>>, list: any[]) => {
        setter([...list, { sheet: '', db: '' }]);
    };

    const removeRow = (setter: React.Dispatch<React.SetStateAction<{ sheet: string, db: string }[]>>, list: any[], index: number) => {
        const copy = [...list];
        copy.splice(index, 1);
        setter(copy);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- TEMPLATES ---
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-sheets-webhook`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // INPUT SCRIPT (Sender)
    const inputScriptCode = `
// [FOGLIO INGRESSO]
// Incollare questo codice in Estensioni > Apps Script
// ⚠️ IMPORTANTE: CLICCA "SALVA CONFIGURAZIONE" IN BASSO PRIMA DI USARE QUESTO SCRIPT!
// Altrimenti il "secret" non sarà salvato e lo script darà errore.

var CONFIG = {
  webhookUrl: "${webhookUrl}",
  studioId: "${studioId}",
  secret: "${inputSecret}",
  apikey: "${anonKey}"
};

function syncData(rowData, headers) {
  var payloadData = {};
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var value = rowData[i];
    if (value !== "") payloadData[header] = value;
  }

  var payload = {
    studio_id: CONFIG.studioId,
    secret: CONFIG.secret,
    data: payloadData
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': { 'Authorization': 'Bearer ' + CONFIG.apikey },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
     var response = UrlFetchApp.fetch(CONFIG.webhookUrl, options);
     console.log(response.getContentText());
  } catch (error) {
     console.error(error);
  }
}

function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var lastRow = rows[rows.length - 1]; 
  syncData(lastRow, headers);
}

function setupTrigger() {
  var sheet = SpreadsheetApp.getActive();
  ScriptApp.newTrigger("onFormSubmit").forSpreadsheet(sheet).onFormSubmit().create();
  SpreadsheetApp.getUi().alert('Trigger attivato! I nuovi inserimenti verranno inviati.');
}
`.trim();

    // OUTPUT SCRIPT (Receiver)
    const outputScriptCode = `
// [FOGLIO MASTER/USCITA]
// 1. Incollare questo codice in Estensioni > Apps Script
// 2. Cliccare su 'Distribuisci' > 'Nuova distribuzione'
// 3. Selezionare tipo: 'Applicazione web'
// 4. Impostare 'Chiunque con Account Google' (o Chiunque) come accesso
// 5. Copiare l'URL generato e incollarlo nelle impostazioni del CRM.

function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var data = json.data;   // { "Colonna A": "Valore", ... }
    var matchKey = json.match_key; // "ID" usually
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); 
    // Opzionale: Se vuoi specificare il nome foglio, usa .getSheetByName("Master Clienti")
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 1. Find Headers Mapping (Column Index)
    var colMap = {};
    for (var i = 0; i < headers.length; i++) {
        colMap[headers[i]] = i + 1; // 1-based index
    }
    
    // 2. Check if ID column exists for deduplication
    // Assuming "ID" column is sent in data if we want matching
    var idColIndex = colMap["ID"]; 
    var existingRowIndex = -1;
    
    if (idColIndex && data["ID"]) {
        var ids = sheet.getRange(2, idColIndex, sheet.getLastRow(), 1).getValues().flat();
        var found = ids.indexOf(data["ID"]);
        if (found !== -1) {
            existingRowIndex = found + 2; // +2 because 1-based and header row
        }
    }
    
    // 3. Prepare Row Data
    // We only update cells that we have data for
    
    if (existingRowIndex !== -1) {
        // Update
        for (var key in data) {
            if (colMap[key]) {
                sheet.getRange(existingRowIndex, colMap[key]).setValue(data[key]);
            }
        }
        return ContentService.createTextOutput("Updated Row " + existingRowIndex);
    } else {
        // Append
        // We need to construct a full row array in order of headers
        var newRow = [];
        for (var i = 0; i < headers.length; i++) {
            var h = headers[i];
            newRow.push(data[h] || ""); // Value or empty
        }
        sheet.appendRow(newRow);
        return ContentService.createTextOutput("Appended Row");
    }
    
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}
`.trim();

    if (loading) return <div className="p-4 text-text-muted">Caricamento impostazioni...</div>;

    return (
        <div className="bg-bg-tertiary p-6 rounded-xl border border-border mt-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                    <FileSpreadsheet size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-primary">Google Sheets (Sync Bidirezionale)</h3>
                    <p className="text-sm text-text-muted">Gestisci flussi separati per Ingresso e Uscita dati.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab('input')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'input'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                >
                    Ingresso (Da Form)
                </button>
                <button
                    onClick={() => setActiveTab('output')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'output'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                >
                    Uscita (Master Clienti)
                </button>
            </div>

            {/* CONTENT */}
            <div className="animate-in fade-in slide-in-from-bottom-2">

                {/* --- INPUT TAB --- */}
                {activeTab === 'input' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-text-primary">Sincronizzazione in Ingresso</h4>
                                <p className="text-xs text-text-muted">Riceve dati da un Google Form/Sheet e aggiorna il CRM.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={inputEnabled} onChange={e => setInputEnabled(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        {inputEnabled && (
                            <>
                                {/* Secret */}
                                <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-text-muted">Webhook Secret</label>
                                        <button onClick={generateSecret} className="text-xs text-accent hover:underline flex items-center gap-1">
                                            <RefreshCw size={12} /> Rigenera
                                        </button>
                                    </div>
                                    <input type="text" readOnly value={inputSecret} className="w-full bg-bg-primary border border-border rounded px-3 py-2 font-mono text-sm text-text-secondary" />
                                </div>

                                {/* Mapping */}
                                <div>
                                    <h5 className="font-bold text-text-primary mb-2 text-sm">Mappatura Campi (Header Foglio -&gt; Colonna DB)</h5>
                                    <div className="space-y-2">
                                        {inputMapping.map((row, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    value={row.sheet}
                                                    onChange={e => updateMapping(setInputMapping, inputMapping, idx, 'sheet', e.target.value)}
                                                    placeholder="Header Foglio"
                                                    className="flex-1 bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary"
                                                />
                                                <span className="text-text-muted">→</span>
                                                <select
                                                    value={row.db}
                                                    onChange={e => updateMapping(setInputMapping, inputMapping, idx, 'db', e.target.value)}
                                                    className="flex-1 bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary"
                                                >
                                                    <option value="">Seleziona...</option>
                                                    {AVAILABLE_COLUMNS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <button onClick={() => removeRow(setInputMapping, inputMapping, idx)} className="text-text-muted hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addRow(setInputMapping, inputMapping)} className="text-xs text-accent flex items-center gap-1"><Plus size={14} /> Aggiungi Riga</button>
                                    </div>
                                </div>

                                {/* Code */}
                                <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-300">Google Apps Script (⚠️ PRIMA SALVA LE IMPOSTAZIONI!)</span>
                                        <button onClick={() => handleCopy(inputScriptCode)} className="text-xs text-accent hover:underline"><Copy size={12} /> Copia</button>
                                    </div>
                                    <pre className="text-xs font-mono text-gray-400 overflow-x-auto max-h-32">{inputScriptCode}</pre>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- OUTPUT TAB --- */}
                {activeTab === 'output' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-text-primary">Sincronizzazione in Uscita (Master)</h4>
                                <p className="text-xs text-text-muted">Invia ogni modifica del CRM a un Foglio Master.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={outputEnabled} onChange={e => setOutputEnabled(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        {outputEnabled && (
                            <>
                                {/* Script URL Input */}
                                <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                                    <label className="text-sm font-medium text-text-primary block mb-1">Web App URL (dallo Script Google)</label>
                                    <input
                                        type="text"
                                        value={outputScriptUrl}
                                        onChange={e => setOutputScriptUrl(e.target.value)}
                                        placeholder="https://script.google.com/macros/s/..."
                                        className="w-full bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary"
                                    />
                                    <p className="text-xs text-text-muted mt-2">
                                        Generato dopo aver pubblicato lo script qui sotto come "Applicazione Web".
                                    </p>
                                </div>

                                {/* Mapping */}
                                <div>
                                    <h5 className="font-bold text-text-primary mb-2 text-sm">Mappatura Campi (Colonna DB -&gt; Header Master)</h5>
                                    <div className="space-y-2">
                                        {outputMapping.map((row, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <select
                                                    value={row.db}
                                                    onChange={e => updateMapping(setOutputMapping, outputMapping, idx, 'db', e.target.value)}
                                                    className="flex-1 bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary"
                                                >
                                                    <option value="">Seleziona...</option>
                                                    {AVAILABLE_COLUMNS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                </select>
                                                <span className="text-text-muted">→</span>
                                                <input
                                                    value={row.sheet}
                                                    onChange={e => updateMapping(setOutputMapping, outputMapping, idx, 'sheet', e.target.value)}
                                                    placeholder="Header Foglio Master"
                                                    className="flex-1 bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text-primary"
                                                />
                                                <button onClick={() => removeRow(setOutputMapping, outputMapping, idx)} className="text-text-muted hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addRow(setOutputMapping, outputMapping)} className="text-xs text-accent flex items-center gap-1"><Plus size={14} /> Aggiungi Riga</button>
                                    </div>
                                </div>

                                {/* Output Code */}
                                <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-300">Google Apps Script (Incolla nel Foglio Master)</span>
                                        <button onClick={() => handleCopy(outputScriptCode)} className="text-xs text-accent hover:underline"><Copy size={12} /> Copia</button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-2">Ricorda: Estensioni &gt; Apps Script &gt; Distribuisci &gt; Nuova Distribuzione &gt; Web App &gt; "Chiunque".</p>
                                    <pre className="text-xs font-mono text-gray-400 overflow-x-auto max-h-32">{outputScriptCode}</pre>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Global Save */}
            <div className="flex justify-end pt-6 border-t border-border mt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Salvataggio...' : 'Salva Tutte le Configurazioni'}
                </button>
            </div>

            {copied && <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-in fade-in transition-opacity">Codice Copiato!</div>}
        </div >
    );
};
