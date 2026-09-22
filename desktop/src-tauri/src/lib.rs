pub mod commands;

use commands::{
    delete_offline_quote, export_cnc_gcode, generate_saw_cut_label, get_workshop_system_info,
    list_offline_quotes, load_offline_quote, load_workshop_offcuts, print_thermal_labels_batch,
    save_offline_quote, save_workshop_offcuts, spool_saw_sheet,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            generate_saw_cut_label,
            export_cnc_gcode,
            get_workshop_system_info,
            save_offline_quote,
            list_offline_quotes,
            load_offline_quote,
            delete_offline_quote,
            print_thermal_labels_batch,
            spool_saw_sheet,
            save_workshop_offcuts,
            load_workshop_offcuts
        ])
        .run(tauri::generate_context!())
        .expect("error while running Baiti Atelier desktop application");
}
