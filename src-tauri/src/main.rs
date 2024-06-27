// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{Duration, Local, NaiveDate};
use core::iter::Enumerate;
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
    _priority: u32,
}

// command to add data into file and heap
#[tauri::command]
fn add_task_to_file(
    name: String,
    date: String,
    category: String,
    completion_time: u32,
    state: tauri::State<AppState>,
) -> Result<String, ()> {
    let date_vector: Vec<&str> = date.split("-").collect();
    let priority: u32 = calculate_priority(date_vector[0], date_vector[1], date_vector[2]);
    println!("{priority}");
    let task: Task = Task {
        _name: name.clone(),
        _date: date.clone(),
        _category: category.clone(),
        _completion_time: completion_time,
        _priority: priority,
    };

    // Push task to heap
    let mut heap = state.heap.lock().unwrap();
    push_heap(&mut heap, task)?;
    heap_up(&mut heap)?;

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

// Function to search a task in heap by name
fn search_heap_by_name(heap: Vec<Option<Box<Task>>>, task_name: String) -> Option<usize> {
    let mut index: usize = 0;
    for (index, i) in heap.iter().enumerate() {
        if let Some(task) = i {
            if task._name == task_name {
                return Some(index);
            }
        }
    }
    None
}

// Function to remove from heap
fn pop_heap(heap: &mut Vec<Option<Box<Task>>>, task_name: String) {

}

// Function to run heap up
fn heap_up(heap: &mut Vec<Option<Box<Task>>>) -> Result<(), ()> {
    let mut index: usize = heap.len() - 1;
    let mut parent_index: usize;
    while index > 0 {
        parent_index = (index - 1) / 2;
        if let Some(parent_task) = heap[parent_index].as_ref() {
            if let Some(child_task) = heap[index].as_ref() {
                if parent_task._priority > child_task._priority {
                    heap.swap( parent_index, index);
                } else if parent_task._priority == child_task._priority {
                    if parent_task._completion_time >= child_task._completion_time {
                        heap.swap( parent_index, index);
                    }
                }
            }
        }
        index = parent_index;
    }
    Ok(())
}

// Function to calculate priority
// Priority is determined by the number of days left for the deadline of the task
fn calculate_priority(year: &str, month: &str, day: &str) -> u32 {
    let date = NaiveDate::from_ymd_opt(
        year.parse::<i32>().unwrap(),
        month.parse::<u32>().unwrap(),
        day.parse::<u32>().unwrap(),
    )
    .unwrap();
    let curr_date = Local::now(); // current date
    let difference: Duration = date - curr_date.date_naive();
    let no_of_days: i64 = difference.num_days();

    // deadline today - priority : 1
    // deadline within 2 days - priority : 2
    // deadline within 7 days - priority : 3
    // deadline within 2 weeks - priority : 4
    // else - priority : 5
    match no_of_days {
        0 => 1,
        1 | 2 => 2,
        3..=7 => 3,
        8..=14 => 4,
        _ => 5,
    }
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
