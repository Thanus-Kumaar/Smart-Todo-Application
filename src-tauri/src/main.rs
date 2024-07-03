// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{Duration, Local, NaiveDate};
use serde::Serialize;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use tauri::{AppHandle, Manager};

// declaring constants
static FILE_PATH: &str = "C:/Users/Tanushkumaaar/OneDrive/Desktop/Tasks.txt";

// struct defining the task
#[derive(Serialize, Clone, Debug)]
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
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    // validating the parameters
    if name == "" || date == "" || category == "" || completion_time == 0 {
        return Err(String::from("Parameters are incorrect!"));
    }
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
    // Write to file
    let string_to_write = format!(
        "{},{},{},{},{}\n",
        name, date, category, completion_time, priority
    );
    let mut file = File::options()
        .write(true)
        .truncate(true)
        .open(FILE_PATH)
        .expect("Unable to open file for writing");
    file.write_all(string_to_write.as_bytes())
        .expect("Error writing into file!");

    println!("HEAP:");
    print_heap(&heap);
    send_heap_to_frontend(app_handle, &heap);
    Ok(String::from("All Good"))
}

#[tauri::command]
fn delete_task(
    name: String,
    state: tauri::State<AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut heap = state.heap.lock().unwrap();
    pop_heap(&mut heap, name).map_err(|e| format!("Error occurred: {}", e))?;
    println!("HEAP:");
    print_heap(&heap);
    send_heap_to_frontend(app_handle, &heap);
    Ok(())
}

// Function to edit task
#[tauri::command]
fn edit_task(
    old_name: String,
    name: String,
    date: String,
    category: String,
    completion_time: u32,
    state: tauri::State<AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    delete_task(old_name, state.clone(), app_handle.clone())?;
    add_task_to_file(name, date, category, completion_time, state, app_handle)?;
    Ok(())
}

// Function to send data of a particular task to frontend
#[tauri::command]
fn send_task_details(name: String, state: tauri::State<AppState>) -> Result<Option<Box<Task>>, String> {
    let mut heap = state.heap.lock().unwrap();
    let index = search_heap_by_name(&mut heap, name);
    let index_to_send: usize = match index {
        Some(index) => index,
        None => return Err(String::from("Task name not found")),
    };
    let task_to_send = &heap[index_to_send];
  Ok(task_to_send.clone())
}

// Function to read from file and update the heap
#[tauri::command]
fn init_heap_from_file(
    state: tauri::State<AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut heap = state.heap.lock().unwrap();
    let mut file = File::open(FILE_PATH).unwrap();
    let mut buffer = String::new();
    let _ = file.read_to_string(&mut buffer);
    let lines: Vec<&str> = buffer.split("\n").collect();
    for line in lines {
        if line != "" {
            let params: Vec<&str> = line.split(",").collect();
            let task: Task = Task {
                _name: params[0].to_string(),
                _date: params[1].to_string(),
                _category: params[2].to_string(),
                _completion_time: params[3].parse::<u32>().unwrap(),
                _priority: params[4].parse::<u32>().unwrap(),
            };
            pop_heap(&mut heap, params[0].to_string())?;
            push_heap(&mut heap, task)?;
        }
    }
    println!("{}", buffer);
    send_heap_to_frontend(app_handle, &heap);
    print_heap(&heap);
    Ok(())
}

#[tauri::command]
 fn add_category_from_frontend(category_name: String, state: tauri::State<AppState>,) -> Result<(), String> {
    let mut cat_list = state.category_list.lock().unwrap();
    add_category(category_name, &mut cat_list);
  Ok(())
}

#[tauri::command]
 fn delete_category_from_frontend(category_name: String, state: tauri::State<AppState>,) -> Result<(), String> {
    let mut cat_list = state.category_list.lock().unwrap();
    delete_category(category_name, &mut cat_list)?;
  Ok(())
}

// Function to send heap from backend to frontend
fn send_heap_to_frontend(app_handle: AppHandle, heap: &Vec<Option<Box<Task>>>) {
    let mut serializable_heap: Vec<Option<Box<Task>>> = Vec::new();
    priority_traverse(heap, &mut serializable_heap, 0);
    println!("NEW HEAP: ");
    print_heap(&serializable_heap);
    // Emit the data
    if let Err(e) = app_handle.emit_all("heap_data", serializable_heap) {
        eprintln!("Failed to emit heap data: {:?}", e);
    }
}

// Function to traverse heap in priority order
fn priority_traverse(heap: &Vec<Option<Box<Task>>>, new_heap: & mut Vec<Option<Box<Task>>>, index: usize) {
    new_heap.push(heap[index].clone());
    let left_index: usize = 2*index + 1;
    let right_index: usize = 2*index + 2;
    println!("length:{}",heap.len());
    if left_index < heap.len() && right_index >= heap.len() {
        priority_traverse(heap, new_heap, left_index);
        return ();
    }
    else if left_index >= heap.len() || right_index >= heap.len() {
        println!("1");
        return ();
    }
    if heap[left_index].as_ref().unwrap()._priority < heap[right_index].as_ref().unwrap()._priority {
        println!("2");
        priority_traverse(heap, new_heap, left_index);
        priority_traverse(heap, new_heap, right_index);
    }
    else if heap[left_index].as_ref().unwrap()._priority > heap[right_index].as_ref().unwrap()._priority {
        println!("3");
        priority_traverse(heap, new_heap, right_index);
        priority_traverse(heap, new_heap, left_index);
    }
    else{
        println!("4");
        if heap[left_index].as_ref().unwrap()._completion_time < heap[right_index].as_ref().unwrap()._completion_time {
            priority_traverse(heap, new_heap, left_index);
            priority_traverse(heap, new_heap, right_index);
        }
        else if heap[left_index].as_ref().unwrap()._completion_time > heap[right_index].as_ref().unwrap()._completion_time {
            priority_traverse(heap, new_heap, right_index);
            priority_traverse(heap, new_heap, left_index);
        }
    }
}

// Function to add data into the heap
fn push_heap(heap: &mut Vec<Option<Box<Task>>>, task: Task) -> Result<(), String> {
    heap.push(Some(Box::new(task)));
    heap_up(heap)?;
    Ok(())
}

// Function to search a task in heap by name
fn search_heap_by_name(heap: &mut Vec<Option<Box<Task>>>, task_name: String) -> Option<usize> {
    for (index, i) in heap.iter().enumerate() {
        if let Some(task) = i {
            if task._name == task_name {
                return Some(index);
            }
        }
    }
    None
}

// Function to run heap up
fn heap_up(heap: &mut Vec<Option<Box<Task>>>) -> Result<(), String> {
    let mut index: usize = heap.len() - 1;
    let mut parent_index: usize;
    while index > 0 {
        parent_index = (index - 1) / 2;
        if let Some(parent_task) = heap[parent_index].as_ref() {
            if let Some(child_task) = heap[index].as_ref() {
                if parent_task._priority > child_task._priority {
                    heap.swap(parent_index, index);
                } else if parent_task._priority == child_task._priority {
                    if parent_task._completion_time >= child_task._completion_time {
                        heap.swap(parent_index, index);
                    }
                }
            }
        }
        index = parent_index;
    }
    Ok(())
}

// Function to run heap down
fn heap_down(heap: &mut Vec<Option<Box<Task>>>, mut index: usize) -> Result<(), ()> {
    let len = heap.len();
    loop {
        let mut smallest = index;
        let left_child = 2 * index + 1;
        let right_child = 2 * index + 2;
        // Check if left child exists and is smaller than the current node
        if left_child < len {
            if let (Some(parent_task), Some(left_task)) = (&heap[smallest], &heap[left_child]) {
                if left_task._priority < parent_task._priority
                    || (left_task._priority == parent_task._priority
                        && left_task._completion_time < parent_task._completion_time)
                {
                    smallest = left_child;
                }
            }
        }
        // Check if right child exists and is smaller than the current smallest node
        if right_child < len {
            if let (Some(smallest_task), Some(right_task)) = (&heap[smallest], &heap[right_child]) {
                if right_task._priority < smallest_task._priority
                    || (right_task._priority == smallest_task._priority
                        && right_task._completion_time < smallest_task._completion_time)
                {
                    smallest = right_child;
                }
            }
        }
        // If the smallest is not the current index, swap and continue
        if smallest != index {
            heap.swap(index, smallest);
            index = smallest;
        } else {
            break;
        }
    }

    Ok(())
}

// Function to calculate priority
// Priority is determined by the number of days left for the deadline of the task (low number = high priority)
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

// Function to remove from heap
fn pop_heap(heap: &mut Vec<Option<Box<Task>>>, task_name: String) -> Result<(), String> {
    if heap.len() == 0 {
        return Ok(());
    }
    let last_index = heap.len() - 1;
    let option_index_to_pop = search_heap_by_name(heap, task_name);
    let index_to_pop: usize = match option_index_to_pop {
        Some(index) => index,
        None => return Err(String::from("Task name not found")),
    };
    heap.swap(index_to_pop, last_index);
    heap.pop();
    heap_down(heap, index_to_pop).expect("Error in heap down!");
    Ok(())
}

// Function to add categories into category name list
fn add_category(cat_name: String, list: &mut Vec<String>) {
    list.push(cat_name);
    print_cat_list(list);
}

// Function to search for a category name
fn search_category(cat_name: String, list: &mut Vec<String>) -> Option<usize> {
    for (index, name) in list.iter().enumerate() {
        if *name == cat_name {
            return Some(index);
        }
    }
    None
}

// Function to delete a category
fn delete_category(cat_name: String, list: &mut Vec<String>) -> Result<(), String> {
    if list.len() == 0{
        return Ok(())
    }
    let i = search_category(cat_name, list);
    let index = match i {
        Some(i) => i,
        None => return Err(String::from("Category name not found")),
    };
    list.remove(index);
    print_cat_list(list);
    Ok(())
}
 
// Function to print category list
fn print_cat_list(list: &mut Vec<String>) {
    for i in list.iter() {
        println!("{}",i);
    }
}

// State struct to hold the heap
struct AppState {
    heap: std::sync::Mutex<Vec<Option<Box<Task>>>>, // Using Mutex for thread safety
    category_list: std::sync::Mutex<Vec<String>>
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
    let categories: Vec<String> = Vec::new();
    let app_state = AppState {
        heap: std::sync::Mutex::new(heap),
        category_list: std::sync::Mutex::new(categories),
    };

    tauri::Builder::default()
        .manage(app_state) // Manage app state
        .invoke_handler(tauri::generate_handler![
            add_task_to_file,
            delete_task,
            init_heap_from_file,
            send_task_details,
            edit_task,
            add_category_from_frontend,
            delete_category_from_frontend
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
