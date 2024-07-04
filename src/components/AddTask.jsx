import { Dialog } from "@mui/material";
import { Alert } from "@mui/material";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function ({
  open,
  setOpen,
  name,
  setName,
  category,
  setCategory,
  date,
  setDate,
  timeToConsume,
  setTime,
  isEdit,
  oldName,
  categoryList,
}) {
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");
  const [displayAlert, setDisplayAlert] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  async function editTask() {
    try {
      const response = await invoke("edit_task", {
        oldName: oldName,
        name: name,
        date: date,
        category: category,
        completionTime: parseInt(timeToConsume, 10),
      });
      console.log(response);
      setAlertMsg("Added task successfully !");
      setAlertType("success");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    } catch (error) {
      console.error("Error invoking command:", error);
      setAlertMsg(error);
      setAlertType("error");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    }
  }

  async function addToFile() {
    try {
      const response = await invoke("add_task_to_file", {
        name: name,
        date: date,
        category: category,
        completionTime: parseInt(timeToConsume, 10),
      });
      console.log(response);
      setAlertMsg("Added task successfully !");
      setAlertType("success");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    } catch (error) {
      console.error("Error invoking command:", error);
      setAlertMsg(error);
      setAlertType("error");
      setDisplayAlert(true);
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} className="">
        <Alert
          severity={alertType}
          style={{ display: displayAlert == false ? "none" : "" }}
        >
          {alertMsg}
        </Alert>
        <div className="p-4 w-[500px] bg-blue-200">
          <div className="text-xl text-center mb-4">
            {isEdit ? "Edit Task" : "Add Task"}
          </div>
          <form
            className="flex flex-col mx-auto gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              isEdit ? editTask() : addToFile();
            }}
          >
            <input
              className="p-2 rounded-md m-2 bg-slate-200 border-[1px] border-black"
              id="task-name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Task Name"
            />
            <select
              name="Category"
              placeholder="Category"
              className="p-2 rounded-md m-2 bg-slate-200 border-[1px] border-black"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
            >
              <option value="" disabled>
                Select a category..
              </option>
              {Array.isArray(categoryList) && categoryList.length > 0 ? (
                categoryList.map((element, index) => {
                  console.log("Option:", element);
                  return (
                    <option key={index} value={element}>
                      {element}
                    </option>
                  );
                })
              ) : (
                ""
              )}
            </select>
            <input
              className="p-2 rounded-md m-2 bg-slate-200 border-[1px] border-black"
              id="due-date"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              type="date"
              placeholder="Due Date"
            />
            <label htmlFor="task-comp-time" className="px-2 m-0">
              Completion Time (in hrs) : {timeToConsume}
            </label>
            <input
              className="px-2 mt-0 rounded-md m-2"
              id="task-comp-time"
              name="task-comp-time"
              value={timeToConsume}
              type="range"
              max={10}
              min={1}
              onChange={(e) => setTime(e.currentTarget.value)}
            />
            <button
              className="bg-blue-500 text-white p-3 w-28 text-center mx-auto rounded-md disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={
                name == "" || category == "" || date == "" || timeToConsume == 0
                  ? true
                  : false
              }
            >
              {isEdit ? "Edit" : "Add"}
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
