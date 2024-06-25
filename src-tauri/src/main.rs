// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::path::Path;
use std::io::prelude::*;

// declaring constants
static FILE_PATH: &str = "C:/Users/Tanushkumaaar/OneDrive/Desktop/Tasks.txt";

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_task_to_file(name: &str, date: &str, category: &str, completion_time: u32) -> Result<String,()> {
    let string_to_write = format!("{},{},{},{}\n",name, date, category, completion_time);
    let mut file = File::options().append(true).open(FILE_PATH).expect("Unable to open file for writing");
    file.write_all(string_to_write.as_bytes()).expect("Error writing into file!");
    Ok(String::from("All Good"))
}

fn main() {
    let path = Path::new(FILE_PATH);
    // create file if it doesn't exist
    File::create(path).expect("Unable to create file");
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_task_to_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
