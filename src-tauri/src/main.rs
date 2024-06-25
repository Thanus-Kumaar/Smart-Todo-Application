// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

// declaring constants
static FILE_PATH: &str = "C:/Users/Tanushkumaaar/OneDrive/Desktop/Tasks.txt";

// struct defining the task
struct Task<'a> {
    _name: &'a str,
    _date: &'a str,
    _category: &'a str,
    _completion_time: u32,
}

// command to add data into file
#[tauri::command]
fn add_task_to_file(
    name: &str,
    date: &str,
    category: &str,
    completion_time: u32,
) -> Result<String, ()> {
    println!("HELLO");
    let string_to_write = format!("{},{},{},{}\n", name, date, category, completion_time);
    let mut file = File::options()
        .append(true)
        .open(FILE_PATH)
        .expect("Unable to open file for writing");
    file.write_all(string_to_write.as_bytes())
        .expect("Error writing into file!");
    Ok(String::from("All Good"))
}

// Other functions
// Function to add data into the heap
fn push_heap<'a>(heap: &mut Vec<Option<Box<Task<'a>>>>, task: Task<'a>) -> Result<i32, ()> {
    heap.push(Some(Box::new(task)));
    Ok(200)
}

// main function that runs the application loop
fn main() {
    let path = Path::new(FILE_PATH);
    // create file if it doesn't exist
    if !path.exists() {
        File::create(path).expect("Unable to create file");
    }
    // creating heap data structure
    let mut heap: Vec<Option<Box<Task>>> = Vec::new();
    let task: Task = Task {
        _name: "asd",
        _date: "1/1/1",
        _category: "qwe",
        _completion_time: 12,
    };
    push_heap(&mut heap, task).expect("Error");
    let task: Task = Task {
        _name: "asd",
        _date: "1/1/1",
        _category: "qwe",
        _completion_time: 12,
    };
    push_heap(&mut heap, task).expect("Error");
    let task: Task = Task {
        _name: "asd",
        _date: "1/1/1",
        _category: "qwe",
        _completion_time: 12,
    };
    push_heap(&mut heap, task).expect("Error");

    for i in &heap{
        if let Some(v) = i{
            println!("{}", v._name);
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_task_to_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
