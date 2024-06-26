import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeToConsume, setTime] = useState();

  async function addToFile() {
    try {
      console.log(typeof date)
      const response = await invoke("add_task_to_file", {
        name: name,
        date: date,
        category: category,
        completionTime: parseInt(timeToConsume, 10),
      });
      console.log(response);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  return (
    <div className="bg-black">
      <h1>Welcome to Tauri!</h1>
      <form
        className="flex flex-col w-[60%] mx-auto gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          addToFile();
        }}
      >
        <input
          className="p-2 rounded-md"
          id="task-name"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Task Name"
        />
        <input
          className="p-2 rounded-md"
          id="task-cat"
          onChange={(e) => setCategory(e.currentTarget.value)}
          placeholder="Category"
        />
        <input
          className="p-2 rounded-md"
          id="due-date"
          onChange={(e) => setDate(e.currentTarget.value)}
          type="date"
          placeholder="Due Date"
        />
        <input
          className="p-2 rounded-md"
          id="task-comp-time"
          onChange={(e) => setTime(e.currentTarget.value)}
          placeholder="Time to complete (hrs)"
        />
        <button
          className="bg-white p-3 w-28 text-center mx-auto rounded-md"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
