import { useEffect, useState } from "react";
import "./App.css";
import AddTask from "./components/AddTask";
import Tasks from "./components/TaskBar";

import { IoMdAdd } from "react-icons/io";
import { TbCategory2 } from "react-icons/tb";
import { MdOutlineAddTask } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Dialog } from "@mui/material";

function App() {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [heap, setHeap] = useState();
  const [initCount, setInitCount] = useState(0);

  const [categoryList, setCatList] = useState();
  const [newCat, setNewCat] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [timeToConsume, setTime] = useState(0);

  const [showAdd, setShowAdd] = useState(false);

  const [openAddCat, setOpenAddCat] = useState(false);
  function handleCatClose() {
    setOpenAddCat(false);
  }

  listen("heap_data", (event) => {
    setHeap(event.payload);
    console.log("Heap data:", event.payload);
  });

  listen("category_data", (event) => {
    if (Array.isArray(event.payload)) {
      setCatList(event.payload);
    } else {
      console.error("Received payload is not an array:", event.payload);
    }
    console.log("Category data:", event.payload, typeof event.payload);
  });

  async function init_heap() {
    try {
      const response = await invoke("init_heap_from_file");
      console.log(response);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  async function init_cat_list() {
    try {
      const response = await invoke("init_cat_list_from_file");
      console.log("#######", response);
    } catch (error) {
      console.error("Error invoking command:", error);
    }
  }

  async function addCategory() {
    try {
      console.log("initialising add category...");
      const response = await invoke("add_category_from_frontend", {
        categoryName: newCat,
      });
      console.log(response);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async function deleteCategory(catName) {
    try {
      console.log("initialising delete category...");
      const response = await invoke("delete_category_from_frontend", {
        categoryName: catName,
      });
      console.log(response);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  useEffect(() => {
    if (initCount == 0) {
      init_heap();
      init_cat_list();
      setInitCount(1);
    }
  }, []);

  return (
    <div className="bg-blue-400 flex flex-col h-screen">
      <div className="p-2 text-center font-semibold bg-blue-200">
        Smart Task Tracker
      </div>
      <div className=" overflow-scroll removeScrollBar">
        <Tasks heapData={heap} setHeapData={setHeap} />
      </div>
      <div className=" absolute bottom-8 right-8 flex flex-col gap-4">
        <div className={showAdd ? "flex flex-row gap-4" : "hidden"}>
          <button
            onClick={() => {
              setName("");
              setDate("");
              setTime("");
              setCategory("");
              setAddTaskOpen(true);
            }}
            className='relative bg-white p-2 w-fit rounded-full before:absolute before:-left-2 before:-top-8 before:h-6 before:w-16 before:content-["Add_Task"] before:text-black before:text-sm before:scale-0 before:transition before:duration-150 hover:before:scale-100'
          >
            <MdOutlineAddTask className="h-8 w-8" />
          </button>
          <button
            onClick={() => {
              setOpenAddCat(true);
            }}
            className='relative bg-white p-2 w-fit rounded-full before:absolute before:-left-2 before:-top-12 before:h-6 before:w-16 before:content-["Add_Category"] before:text-black before:text-sm before:scale-0 before:transition before:duration-150 hover:before:scale-100'
          >
            <TbCategory2 className="h-8 w-8" />
          </button>
        </div>
        <button
          onClick={() => {
            if (showAdd == true) setShowAdd(false);
            else setShowAdd(true);
          }}
          className={
            showAdd
              ? "bg-red-400 ml-16 p-2 w-fit rounded-full"
              : "bg-white ml-16 p-2 w-fit rounded-full"
          }
        >
          {showAdd ? (
            <IoMdClose className="h-8 w-8" />
          ) : (
            <IoMdAdd className="h-8 w-8" />
          )}
        </button>
      </div>
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
        categoryList={categoryList}
      />
      <Dialog open={openAddCat} onClose={handleCatClose}>
        <div className="p-6 w-80">
          <div className="flex flex-col gap-1">
            <label className="block text-sm" htmlFor="catName">
              Category Name
            </label>
            <input
              className="bg-slate-200 pl-2 p-1"
              value={newCat}
              onChange={(e) => {
                setNewCat(e.target.value);
              }}
              placeholder="Name"
              type="text"
              name="catName"
            />
            <button
              onClick={() => addCategory()}
              className="p-2 bg-green-300 w-14 mt-2 mx-auto rounded-md text-xs"
            >
              Add
            </button>
          </div>

          <div className="text-center mt-10 font-bold">Current Categories</div>
          <div className="flex flex-row gap-2 flex-wrap mt-4">
            {categoryList != undefined ? (
              categoryList.map((category, index) => (
                <div
                  className="bg-slate-200 rounded-full w-fit px-2 flex flex-row pl-2"
                  key={index}
                >
                  <div>{category}</div>
                  <div onClick={() => deleteCategory(category)}>
                    <IoCloseCircle className="h-4 w-4 mt-1 cursor-pointer ml-2" />
                  </div>
                </div>
              ))
            ) : (
              <div>No categories created!</div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default App;
