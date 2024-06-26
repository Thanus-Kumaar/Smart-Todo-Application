// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

// declaring constants
static FILE_PATH: &str = "C:/Users/Tanushkumaaar/OneDrive/Desktop/Tasks.txt";

// struct defining the task
#[derive(Debug)]
struct Task {
    _name: String,
    _date: String,
    _category: String,
    _completion_time: u32,
}

// command to add data into file and heap
#[tauri::command]
fn add_task_to_file(
    name: String,
    date: String,
    category: String,
    completion_time: u32,
    state: tauri::State<'_, AppState>,
) -> Result<String, ()> {
    let task: Task = Task {
        _name: name.clone(),
        _date: date.clone(),
        _category: category.clone(),
        _completion_time: completion_time,
    };
    
    // Push task to heap
    let mut heap = state.heap.lock().unwrap();
    push_heap(&mut heap, task)?;

    // Write to file
    let string_to_write = format!("{},{},{},{}\n", name, date, category, completion_time);
    let mut file = File::options()
        .append(true)
        .open(FILE_PATH)
        .expect("Unable to open file for writing");
    file.write_all(string_to_write.as_bytes())
        .expect("Error writing into file!");

    print_heap(&heap);

    Ok(String::from("All Good"))
}

// Function to add data into the heap
fn push_heap(heap: &mut Vec<Option<Box<Task>>>, task: Task) -> Result<(), ()> {
    heap.push(Some(Box::new(task)));
    Ok(())
}

// Function to print heap
fn print_heap(heap: &Vec<Option<Box<Task>>>) {
    for i in heap {
        if let Some(v) = i {
            println!("{}", v._name);
        }
    }
}

// State struct to hold the heap
struct AppState {
    heap: std::sync::Mutex<Vec<Option<Box<Task>>>>, // Using Mutex for thread safety
}

// main function that runs the application loop
fn main() {
    // Create file if it doesn't exist
    let path = Path::new(FILE_PATH);
    if !path.exists() {
        File::create(path).expect("Unable to create file");
    }

    // Initialize the heap
    let heap: Vec<Option<Box<Task>>> = Vec::new();
    let app_state = AppState {
        heap: std::sync::Mutex::new(heap),
    };

    tauri::Builder::default()
        .manage(app_state) // Manage app state
        .invoke_handler(tauri::generate_handler![add_task_to_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
