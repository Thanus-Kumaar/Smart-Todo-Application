import { useState } from "react";
import "./App.css";
import AddTask from "./components/AddTask";

function App() {
  const [deletionName, setDelName] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  async function deleteTask() {
    try {
      const response = await invoke("delete_task", {
        name: deletionName,
      });
      console.log(response);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  return (
    <div className="bg-black flex flex-col gap-8">
      <h1>Welcome to Tauri!</h1>
      <button
        onClick={() => {
          setAddTaskOpen(true);
        }}
        className="bg-white p-2"
      >
        Add Task
      </button>
      <AddTask open={addTaskOpen} setOpen={setAddTaskOpen} />
      <form
        className="flex flex-row w-[60%] mx-auto gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          deleteTask();
        }}
      >
        <input
          type="text"
          className="p-2 rounded-md flex-1"
          id="delete-name"
          placeholder="Enter Name to delete"
          onChange={(e) => setDelName(e.target.value)}
          value={deletionName}
        />
        <button
          className="bg-white p-3 w-28 text-center mx-auto rounded-md"
          type="submit"
        >
          Delete
        </button>
      </form>
    </div>
  );
}

export default App;
