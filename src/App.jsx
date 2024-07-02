import { useEffect, useState } from "react";
import "./App.css";
import AddTask from "./components/AddTask";
import Tasks from "./components/TaskBar";
import { IoMdAdd } from "react-icons/io";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";

function App() {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [heap, setHeap] = useState();
  const [initCount, setInitCount] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeToConsume, setTime] = useState(0);

  listen("heap_data", (event) => {
    setHeap(event.payload);
    console.log("Heap data:", event.payload);
  });

  async function init_heap() {
    try {
      const response = await invoke("init_heap_from_file");
      console.log(response);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  useEffect(() => {
    if (initCount == 0) {
      init_heap();
      setInitCount(1);
    }
  }, []);

  return (
    <div className="bg-blue-400 flex flex-col gap-8 h-screen overflow-scroll removeScrollBar">
      <div className="text-[30px] mt-4 text-center font-semibold">
        Smart Task Tracker
      </div>
      <Tasks heapData={heap} setHeapData={setHeap} />
      <button
        onClick={() => {
          setAddTaskOpen(true);
        }}
        className="bg-white p-2 w-fit rounded-full absolute bottom-8 right-8"
      >
        <IoMdAdd className="h-8 w-8" />
      </button>
      <AddTask
        open={addTaskOpen}
        setOpen={setAddTaskOpen}
        name={name}
        setName={setName}
        category={category}
        setCategory={setCategory}
        date={date}
        setDate={setDate}
        timeToConsume={timeToConsume}
        setTime={setTime}
        isEdit={false}
      />
    </div>
  );
}

export default App;
