use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct SawCutPiece {
    pub id: String,
    pub piece_name: String,
    pub profile_code: String,
    pub length_mm: f64,
    pub left_angle: f64,
    pub right_angle: f64,
    pub job_name: String,
    pub bar_index: usize,
    pub sequence: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ThermalLabelResponse {
    pub svg_label: String,
    pub piece_id: String,
    pub print_ready_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CncCutItem {
    pub length_mm: f64,
    pub left_angle: f64,
    pub right_angle: f64,
    pub label: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CncBarSpec {
    pub bar_index: usize,
    pub profile_name: String,
    pub total_length_mm: f64,
    pub cuts: Vec<CncCutItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkshopSystemInfo {
    pub app_version: String,
    pub os_family: String,
    pub offline_storage_active: bool,
    pub thermal_printer_ready: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OfflineQuote {
    pub id: String,
    pub title: String,
    pub trade_type: String,
    pub client_name: String,
    pub client_phone: String,
    pub client_wilaya: String,
    pub total_ht_dzd: f64,
    pub total_ttc_dzd: f64,
    pub deposit_required_dzd: f64,
    pub created_at: String,
    pub payload_json: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OfflineQuoteSummary {
    pub id: String,
    pub title: String,
    pub trade_type: String,
    pub client_name: String,
    pub client_wilaya: String,
    pub total_ttc_dzd: f64,
    pub created_at: String,
}

fn validate_safe_id(id: &str) -> Result<(), String> {
    if id.is_empty() {
        return Err("ID cannot be empty".to_string());
    }
    if id.contains('/') || id.contains('\\') || id.contains("..") {
        return Err("Invalid identifier: path traversal detected".to_string());
    }
    if !id.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_') {
        return Err("Invalid identifier: allowed characters are alphanumeric, '-', and '_'".to_string());
    }
    Ok(())
}

fn get_quotes_dir() -> Result<PathBuf, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let dir = base.join("BaitiAtelier").join("quotes");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create quotes directory: {}", e))?;
    }
    Ok(dir)
}

#[tauri::command]
pub fn generate_saw_cut_label(piece: SawCutPiece) -> Result<ThermalLabelResponse, String> {
    let svg = format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
  <rect width="300" height="180" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
  <text x="14" y="24" font-family="monospace" font-size="14" font-weight="bold" fill="#000000">BAITI ATELIER | بيتي - FICHE DÉBIT</text>
  <line x1="14" y1="30" x2="286" y2="30" stroke="#000000" stroke-width="1.5"/>
  <text x="14" y="50" font-family="sans-serif" font-size="12" fill="#333333">PROJET: <tspan font-weight="bold" fill="#000000">{}</tspan></text>
  <text x="14" y="70" font-family="sans-serif" font-size="12" fill="#333333">PROFILÉ: <tspan font-weight="bold" fill="#000000">{}</tspan></text>
  <text x="14" y="90" font-family="sans-serif" font-size="12" fill="#333333">PIÈCE: <tspan font-weight="bold" fill="#000000">{}</tspan></text>
  
  <rect x="14" y="102" width="272" height="42" fill="#F3F4F6" stroke="#000000" stroke-width="1"/>
  <text x="24" y="130" font-family="monospace" font-size="22" font-weight="bold" fill="#000000">{:.1} mm</text>
  <text x="170" y="122" font-family="sans-serif" font-size="10" fill="#4B5563">ANGLES: {}° / {}°</text>
  <text x="170" y="136" font-family="sans-serif" font-size="10" fill="#4B5563">BARRE #{} • POS #{}</text>

  <text x="14" y="165" font-family="monospace" font-size="9" fill="#6B7280">ID: {}</text>
  <text x="220" y="165" font-family="monospace" font-size="9" font-weight="bold" fill="#000000">ALGERIE 58W</text>
</svg>"##,
        piece.job_name,
        piece.profile_code,
        piece.piece_name,
        piece.length_mm,
        piece.left_angle,
        piece.right_angle,
        piece.bar_index,
        piece.sequence,
        piece.id
    );

    let text_format = format!(
        "BAITI SAW CUT LABEL\nJOB: {}\nPROFILE: {}\nPIECE: {}\nLENGTH: {:.1}mm\nANGLES: {} / {}\nBAR: {} | POS: {}\nID: {}",
        piece.job_name, piece.profile_code, piece.piece_name, piece.length_mm, piece.left_angle, piece.right_angle, piece.bar_index, piece.sequence, piece.id
    );

    Ok(ThermalLabelResponse {
        svg_label: svg,
        piece_id: piece.id,
        print_ready_text: text_format,
    })
}

#[tauri::command]
pub fn export_cnc_gcode(job_name: String, bars: Vec<CncBarSpec>) -> Result<String, String> {
    let mut gcode = String::new();
    gcode.push_str(&format!("; ==========================================\n"));
    gcode.push_str(&format!("; BAITI ATELIER | بيتي CNC SAW DEBIT PROGRAM\n"));
    gcode.push_str(&format!("; JOB: {}\n", job_name));
    gcode.push_str(&format!("; UNITS: METRIC (MM)\n"));
    gcode.push_str(&format!("; ==========================================\n\n"));
    gcode.push_str("G21 ; Millimeter units\n");
    gcode.push_str("G90 ; Absolute positioning\n\n");

    for bar in bars {
        gcode.push_str(&format!("; --- START BAR {} [Profile: {} | Stock: {:.1}mm] ---\n", bar.bar_index, bar.profile_name, bar.total_length_mm));
        gcode.push_str("M08 ; Clamp profile with pneumatic pressure\n");

        for (idx, cut) in bar.cuts.iter().enumerate() {
            gcode.push_str(&format!("; Piece {}: {} ({:.1}mm, Left: {}°, Right: {}°)\n", idx + 1, cut.label, cut.length_mm, cut.left_angle, cut.right_angle));
            gcode.push_str(&format!("G00 X{:.2} ; Position saw feeder head\n", cut.length_mm));
            gcode.push_str(&format!("M21 A{:.1} B{:.1} ; Set miter angles\n", cut.left_angle, cut.right_angle));
            gcode.push_str("M03 S2800 ; Engage saw circular blade 2800 RPM\n");
            gcode.push_str("G01 Z-120.0 F800 ; Execute through-cut stroke with oil mist\n");
            gcode.push_str("G00 Z10.0 ; Retract blade\n");
            gcode.push_str("M05 ; Blade stop\n\n");
        }

        gcode.push_str("M09 ; Release pneumatic clamps\n");
        gcode.push_str(&format!("; --- END BAR {} ---\n\n", bar.bar_index));
    }

    gcode.push_str("M30 ; End of program\n");
    Ok(gcode)
}

#[tauri::command]
pub fn get_workshop_system_info() -> Result<WorkshopSystemInfo, String> {
    Ok(WorkshopSystemInfo {
        app_version: "1.0.0".to_string(),
        os_family: std::env::consts::OS.to_string(),
        offline_storage_active: true,
        thermal_printer_ready: true,
    })
}

#[tauri::command]
pub fn save_offline_quote(quote: OfflineQuote) -> Result<String, String> {
    validate_safe_id(&quote.id)?;
    let dir = get_quotes_dir()?;
    let path = dir.join(format!("{}.json", quote.id));
    let json = serde_json::to_string_pretty(&quote)
        .map_err(|e| format!("Serialization error: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write quote file: {}", e))?;
    Ok(quote.id)
}

#[tauri::command]
pub fn list_offline_quotes() -> Result<Vec<OfflineQuoteSummary>, String> {
    let dir = get_quotes_dir()?;
    let mut list = Vec::new();

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(q) = serde_json::from_str::<OfflineQuote>(&content) {
                        list.push(OfflineQuoteSummary {
                            id: q.id,
                            title: q.title,
                            trade_type: q.trade_type,
                            client_name: q.client_name,
                            client_wilaya: q.client_wilaya,
                            total_ttc_dzd: q.total_ttc_dzd,
                            created_at: q.created_at,
                        });
                    }
                }
            }
        }
    }

    list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(list)
}

#[tauri::command]
pub fn load_offline_quote(id: String) -> Result<OfflineQuote, String> {
    validate_safe_id(&id)?;
    let dir = get_quotes_dir()?;
    let path = dir.join(format!("{}.json", id));
    if !path.exists() {
        return Err(format!("Quote with id '{}' does not exist", id));
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read quote file: {}", e))?;
    let quote: OfflineQuote = serde_json::from_str(&content)
        .map_err(|e| format!("Deserialization error: {}", e))?;
    Ok(quote)
}

#[tauri::command]
pub fn delete_offline_quote(id: String) -> Result<bool, String> {
    validate_safe_id(&id)?;
    let dir = get_quotes_dir()?;
    let path = dir.join(format!("{}.json", id));
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to remove quote file: {}", e))?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PrintJobResult {
    pub success: bool,
    pub job_id: String,
    pub items_printed: usize,
    pub spool_path: String,
    pub message: String,
}

#[tauri::command]
pub fn print_thermal_labels_batch(labels: Vec<String>) -> Result<PrintJobResult, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let spool_dir = base.join("BaitiAtelier").join("spool");
    if !spool_dir.exists() {
        fs::create_dir_all(&spool_dir)
            .map_err(|e| format!("Failed to create spool directory: {}", e))?;
    }

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let job_id = format!("JOB-LABEL-{}", timestamp);
    let file_path = spool_dir.join(format!("{}.prn", job_id));

    let joined_labels = labels.join("\n\n--- SUIVANT ---\n\n");
    fs::write(&file_path, joined_labels)
        .map_err(|e| format!("Failed to write spool job file: {}", e))?;

    Ok(PrintJobResult {
        success: true,
        job_id,
        items_printed: labels.len(),
        spool_path: file_path.to_string_lossy().to_string(),
        message: format!("Lot de {} étiquettes envoyé au spouleur thermique", labels.len()),
    })
}

#[tauri::command]
pub fn spool_saw_sheet(job_name: String, sheet_content: String) -> Result<String, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let sheets_dir = base.join("BaitiAtelier").join("sheets");
    if !sheets_dir.exists() {
        fs::create_dir_all(&sheets_dir)
            .map_err(|e| format!("Failed to create sheets directory: {}", e))?;
    }

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let clean_job = job_name.replace(' ', "_").replace('/', "-");
    let file_name = format!("debit_{}_{}.txt", clean_job, timestamp);
    let file_path = sheets_dir.join(file_name);

    fs::write(&file_path, sheet_content)
        .map_err(|e| format!("Failed to write sheet file: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_workshop_offcuts(offcuts_json: String) -> Result<bool, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let dir = base.join("BaitiAtelier");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    let file_path = dir.join("offcuts.json");
    fs::write(&file_path, offcuts_json)
        .map_err(|e| format!("Failed to write offcuts file: {}", e))?;
    Ok(true)
}

#[tauri::command]
pub fn load_workshop_offcuts() -> Result<String, String> {
    let base = std::env::var("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());
    let file_path = base.join("BaitiAtelier").join("offcuts.json");
    if !file_path.exists() {
        return Ok("[]".to_string());
    }
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read offcuts file: {}", e))?;
    Ok(content)
}
